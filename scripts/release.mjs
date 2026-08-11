// ビルド → AMO へアップロード → バージョン作成 → 署名済み xpi の取得までを通しで行う。
// web-ext sign は同じ鍵でも Unknown JWT iss を返すことがあるため、API を直接叩く。
//
// 使い方:
//   AMO_JWT_ISSUER=user:... AMO_JWT_SECRET=... node scripts/release.mjs

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ISSUER = process.env.AMO_JWT_ISSUER;
const SECRET = process.env.AMO_JWT_SECRET;

if (!ISSUER || !SECRET) {
  console.error("AMO_JWT_ISSUER と AMO_JWT_SECRET を設定してください。");
  process.exit(1);
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://addons.mozilla.org/api/v5";
const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"),
);
const GUID = manifest.browser_specific_settings.gecko.id;
const VERSION = manifest.version;

/** AMO の JWT は有効期間が短いので、リクエストごとに作り直す。 */
function token() {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const iat = Math.floor(Date.now() / 1000);
  const head = encode({ alg: "HS256", typ: "JWT" });
  const body = encode({
    exp: iat + 60,
    iat,
    iss: ISSUER,
    jti: crypto.randomUUID(),
  });
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${head}.${body}`)
    .digest("base64url");

  return `${head}.${body}.${signature}`;
}

const api = (target, init = {}) =>
  fetch(target.startsWith("http") ? target : `${BASE}${target}`, {
    ...init,
    headers: { Authorization: `JWT ${token()}`, ...init.headers },
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function poll(label, attempts, interval, check) {
  for (let i = 0; i < attempts; i += 1) {
    const result = await check();

    if (result) return result;

    await sleep(interval);
  }

  throw new Error(`${label} がタイムアウトしました。`);
}

// 1. パッケージを作る
execFileSync("npx", ["--yes", "web-ext@8", "build", "--overwrite-dest"], {
  cwd: ROOT,
  stdio: "inherit",
});

const artifacts = path.join(ROOT, "web-ext-artifacts");
const zip = fs
  .readdirSync(artifacts)
  .filter((name) => name.endsWith(`-${VERSION}.zip`))
  .map((name) => path.join(artifacts, name))
  .at(0);

if (!zip) throw new Error(`${VERSION} の zip が見つかりません。`);

// 2. アップロードして検証を待つ
const form = new FormData();

form.append("upload", new Blob([fs.readFileSync(zip)]), path.basename(zip));
form.append("channel", "unlisted");

const uploaded = await (
  await api("/addons/upload/", { body: form, method: "POST" })
).json();

if (!uploaded.uuid) throw new Error(`アップロード失敗: ${JSON.stringify(uploaded)}`);

console.log(`upload: ${uploaded.uuid}`);

const validated = await poll("検証", 40, 5000, async () => {
  const state = await (await api(`/addons/upload/${uploaded.uuid}/`)).json();

  return state.processed ? state : null;
});

if (!validated.valid) {
  console.error(JSON.stringify(validated.validation?.messages ?? validated, null, 2));
  throw new Error("検証に失敗しました。");
}

// 3. バージョンを作る
const created = await api(`/addons/addon/${GUID}/versions/`, {
  body: JSON.stringify({ upload: uploaded.uuid }),
  headers: { "Content-Type": "application/json" },
  method: "POST",
});
const version = await created.json();

if (!created.ok) throw new Error(`バージョン作成失敗: ${JSON.stringify(version)}`);

console.log(`version: ${version.version} (${version.id})`);

// 4. 署名が終わり、拡張子が xpi になるまで待つ
const url = await poll("署名", 40, 10000, async () => {
  const detail = await (
    await api(`/addons/addon/${GUID}/versions/${version.id}/`)
  ).json();

  return detail.file?.url?.endsWith(".xpi") ? detail.file.url : null;
});
const out = path.join(artifacts, `amazon-order-hide-kindle-${VERSION}.xpi`);

fs.writeFileSync(out, Buffer.from(await (await api(url)).arrayBuffer()));
console.log(`signed: ${out}`);
