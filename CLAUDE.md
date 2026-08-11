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
- `content.js` — 「Kindle版」のテキストノードから親をたどり、「注文番号」を1件だけ含む最小の祖先を注文カードとみなして隠す。右下のトグル、`localStorage` での状態保持、無限スクロール対応まで全てここ
- `icons/icon.svg` — アイコンの原本。PNG は生成物

### スクリプト

- `scripts/build-icons.mjs` — SVG から拡張用と LP 用の PNG を生成
- `scripts/release.mjs` — ビルドから AMO 署名済み xpi の取得まで

## Key Design Decisions

- **クラス名に依存しない**: Amazon のマークアップは頻繁に変わるため、注文カードは「注文番号」という表記から特定する。2件以上含む範囲まで遡ったら何もしない安全弁を入れている
- **判定文字列は日本語のまま**: `Kindle版` と `注文番号` は Amazon が実際にページへ出している表記。ここだけは英語化しない
- **web-ext sign を使わない**: 同じ鍵でも `Unknown JWT iss (issuer)` を返したり返さなかったりする。API を直接叩くと安定するため `scripts/release.mjs` を自前で持つ
- **アイコンの角丸は後処理**: macOS に透過を保つ SVG ラスタライザが入っていない。全面塗りで書き出し、アルファチャネルを書き換えて角を抜く
- **状態は localStorage**: 同一オリジンなので、Infy Scroll が iframe で追加したページとも `storage` イベントで同期できる

## Commands

```bash
node scripts/build-icons.mjs   # アイコン生成
npx web-ext lint --source-dir . # 検証
AMO_JWT_ISSUER=... AMO_JWT_SECRET=... node scripts/release.mjs  # 署名済み xpi

cd lp && pnpm dev              # LP 開発サーバー
cd lp && pnpm build            # LP ビルド
```

## リリース手順

1. `manifest.json` の `version` を上げる（AMO は同じバージョンを二度受け付けない）
2. `node scripts/release.mjs` で署名済み xpi を取得
3. `gh release create vX.Y.Z web-ext-artifacts/amazon-order-hide-kindle-X.Y.Z.xpi`

## Conventions

- **コミットメッセージは英語の Conventional Commits**。`feat(lp): trim the landing page to a hero and three points` のように、type とスコープは小文字、本文も小文字始まりで句点なし。他リポジトリ（kk-web、galopen）と揃える
- README とコード内コメントは英語。この CLAUDE.md のみ日本語
