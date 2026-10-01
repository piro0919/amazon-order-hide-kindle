# Hide Kindle Orders

Amazon.co.jp の注文履歴から「Kindle版」を含む注文カードを隠す Firefox 拡張機能。LP は `lp/` に同居。

## Tech Stack

- **Manifest V3** (content script 1枚のみ、バックグラウンド無し)
- **Next.js 16 + Tailwind CSS 4 + next-intl** (`lp/`)
- **pnpm** (LP のパッケージマネージャ)
- **AMO unlisted 署名** (ストア非公開の自分用配布)

## Architecture

### 拡張本体

- `manifest.json` — 注文履歴の URL にのみ content script を注入。`all_frames: true`
- `content.js` — 「Kindle版」のテキストノードから親をたどり、「注文番号」を1件だけ含む最小の祖先を注文カードとみなして隠す。右下のトグル、`browser.storage.local` での状態保持、無限スクロール対応まで全てここ
- `icons/icon.svg` — アイコンの原本。PNG は生成物

### テスト

- `test/content.test.js` — jsdom に `test/fixtures/order-history.html` を読み込み、`content.js` をそのまま実行して印の付いたカードを確かめる。`browser.storage` は差し替え
- フィクスチャは Amazon のマークアップの形だけを写した手書き。実際の注文の名前・番号・金額を入れない
- ルートの `package.json` はテスト用の jsdom のためだけにある。`webExt.ignoreFiles` で `lp/` とテスト一式を拡張のパッケージから外している

### スクリプト

- `scripts/build-icons.mjs` — SVG から拡張用と LP 用の PNG を生成
- `scripts/release.mjs` — ビルドから AMO 署名済み xpi の取得まで

## Key Design Decisions

- **クラス名に依存しない**: Amazon のマークアップは頻繁に変わるため、注文カードは「注文番号」という表記から特定する。2件以上含む範囲まで遡ったら何もしない安全弁を入れている
- **監視範囲だけはコンテナの id で絞る**: MutationObserver は注文一覧のコンテナ（`#ordersContainer` など）だけを見て、再走査は 200ms でまとめる。広告や推薦欄の再描画で全文書を走査し直さないため。見つからなければ body 全体を見る。カードの判定そのものは引き続きクラス名に依存しない。コンテナの外に足されたページは AutoPagerize 系のイベントと 15 秒ごとの全走査で拾う
- **判定文字列は日本語のまま**: `Kindle版` と `注文番号` は Amazon が実際にページへ出している表記。ここだけは英語化しない
- **web-ext sign を使わない**: 同じ鍵でも `Unknown JWT iss (issuer)` を返したり返さなかったりする。API を直接叩くと安定するため `scripts/release.mjs` を自前で持つ
- **アイコンの角丸は後処理**: macOS に透過を保つ SVG ラスタライザが入っていない。全面塗りで書き出し、アルファチャネルを書き換えて角を抜く
- **状態は browser.storage.local**: Amazon の localStorage に置くとページ側から読み書きできてしまうため、拡張専用の領域に置く。`storage.onChanged` は全フレームに届くので、Infy Scroll が iframe で追加したページとも同期できる。1.1.3 までの localStorage の値は初回読み込み時に一度だけ移して消す

## Commands

```bash
node scripts/build-icons.mjs   # アイコン生成
npx web-ext lint --source-dir . --self-hosted # 検証
pnpm install && pnpm test      # content.js を test/fixtures の模造 HTML に当てる回帰テスト
AMO_JWT_ISSUER=... AMO_JWT_SECRET=... node scripts/release.mjs  # 署名済み xpi

cd lp && pnpm dev              # LP 開発サーバー
cd lp && pnpm build            # LP ビルド
```

## リリース手順

1. `manifest.json` の `version` を上げる（AMO は同じバージョンを二度受け付けない）
2. `node scripts/release.mjs` で署名済み xpi を取得。同時に `lp/public/updates.json` へ新しい版が追記される
3. `gh release create vX.Y.Z web-ext-artifacts/amazon-order-hide-kindle-X.Y.Z.xpi`
4. `manifest.json` と `lp/public/updates.json` をコミットして push。LP と一緒に `https://hide-kindle-orders.kkweb.io/updates.json` が更新され、入れている Firefox が自動で新しい版を取りに来る

`updates.json` の `update_link` は GitHub Release の添付ファイルを指すので、3 より先に 4 を出さない。`update_hash` は手で書き換えない。

### 自動更新

`manifest.json` の `browser_specific_settings.gecko.update_url` が LP の `/updates.json` を指す。ファイルの実体は `lp/public/updates.json` で、LP の middleware は拡張子付きのパスを素通しするので静的ファイルとしてそのまま配信される。1.1.3 以前の版には `update_url` が無いため、そこからは一度だけ手動で入れ替える必要がある。

CI の `web-ext lint` に `--self-hosted` を付けているのはこのため。外すと `update_url` が AMO 公開版では使えないというエラーになる。

## Conventions

- **コミットメッセージは英語の Conventional Commits**。`feat(lp): trim the landing page to a hero and three points` のように、type とスコープは小文字、本文も小文字始まりで句点なし。他リポジトリ（kk-web、galopen）と揃える
- README とコード内コメントは英語。この CLAUDE.md のみ日本語
