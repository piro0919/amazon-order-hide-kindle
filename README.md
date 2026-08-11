# Amazon 注文履歴 Kindle非表示

Amazon.co.jp の注文履歴ページで、「Kindle版」の表記を含む注文カードを非表示にする Firefox 拡張機能です。

## 読み込み方（一時的な読み込み）

1. Firefox で `about:debugging#/runtime/this-firefox` を開く
2. 「一時的なアドオンを読み込む」をクリック
3. このディレクトリの `manifest.json` を選択
4. [注文履歴](https://www.amazon.co.jp/gp/css/order-history)を開く

一時的な読み込みは Firefox を再起動すると消えます。

## 常用する（署名済み xpi）

通常版の Firefox は署名のない拡張を恒久インストールできません。自分専用の署名は AMO で無料で取得できます。

1. [AMO の API キー発行ページ](https://addons.mozilla.org/ja/developers/addon/api/key/)で JWT issuer と secret を取得する
2. 以下を実行する

   ```sh
   npx web-ext sign --channel unlisted \
     --api-key "$AMO_JWT_ISSUER" \
     --api-secret "$AMO_JWT_SECRET"
   ```

3. `web-ext-artifacts/` に出力された xpi を `about:addons` の歯車から「ファイルからアドオンをインストール」で入れる

`--channel unlisted` は AMO のストアに公開せず、自分用の署名だけを受け取るモードです。審査は自動チェックのみで通ります。

パッケージだけ作る場合は `npx web-ext build` で `web-ext-artifacts/` に zip が出ます。

## トグル

注文履歴の右下にボタンが出ます。ラベルは現在の状態を表し、「Kindle：非表示」なら隠れている状態、「Kindle：表示」なら出ている状態です。クリックで入れ替わります。色は固定で、普段は薄く表示され、ホバーかキーボードフォーカスで濃くなります。

状態は `localStorage` に保存するので、開き直しても維持されます。同一オリジンなので、Infy Scroll が iframe で追加したページも同じ状態で読み込まれ、切り替えは `storage` イベントで追随します。

## 仕組み

`content.js` がページ内の「Kindle版」というテキストを探し、そこから親をたどって「注文番号」を1件だけ含む最小の祖先要素を注文カードとみなして `display: none` を当てます。クラス名に依存しないため、Amazon 側の DOM 変更に比較的強い作りです。無限スクロールや遅延描画に備えて MutationObserver で再実行します。

## Infy Scroll との併用

2ページ目以降にも効くよう、以下の3つを入れています。

- `all_frames: true`（Infy Scroll の Iframe / AJAX モードでは追加ページが iframe 内に入るため）
- `GM_AutoPagerizeLoaded` などの AutoPagerize 系イベントの購読
- 1.5秒ごとの再スキャン（保険）

それでも 2 ページ目以降が消えない場合は、Infy Scroll の append モードを Element（AutoPagerize モード）に変えると確実です。

## 既知の制限

- 件数表示（「390件の注文」）は Amazon 側の値なので変わりません
- ページングも Amazon 側が決めるため、非表示にした分 1 ページの表示件数が減ります
- 「Kindle版」が付いた商品を含む注文は、同じ注文に紙の商品があってもカードごと消えます
