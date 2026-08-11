# Hide Kindle Orders

A Firefox extension that hides order cards containing "Kindle版" on the Amazon.co.jp order history page.

## Temporary install

1. Open `about:debugging#/runtime/this-firefox` in Firefox
2. Click "Load Temporary Add-on"
3. Pick `manifest.json` from this directory
4. Open the [order history](https://www.amazon.co.jp/gp/css/order-history)

A temporary add-on is dropped when Firefox restarts.

## Permanent install (signed xpi)

Release Firefox will not permanently install an unsigned extension. A self-distributed signature is free on AMO.

1. Get a JWT issuer and secret on the [AMO API key page](https://addons.mozilla.org/en-US/developers/addon/api/key/). A freshly generated key stays inactive until you follow the confirmation link sent by email
2. Bump `version` in `manifest.json`. AMO rejects a version it has already seen
3. Run:

   ```sh
   AMO_JWT_ISSUER='user:...' AMO_JWT_SECRET='...' node scripts/release.mjs
   ```

4. Install the xpi from `web-ext-artifacts/` through the gear menu in `about:addons` → "Install Add-on From File"

This uses the unlisted channel, so the add-on is signed for personal use and never published to the store. Review is automated only.

`npx web-ext sign` is deliberately avoided: with the very same credentials it returns `Unknown JWT iss (issuer)` intermittently. Hitting the API directly is reliable, so `scripts/release.mjs` handles the build, upload, validation polling, version creation, and signed-xpi download itself.

To build a package without signing, run `npx web-ext build`; the zip lands in `web-ext-artifacts/`.

## Toggle

A button sits in the bottom right of the order history. Its label reflects the current state: "Kindle: hidden" means the orders are hidden, "Kindle: shown" means they are visible. Clicking flips it. The color is fixed; the button is translucent at rest and becomes opaque on hover or keyboard focus.

The state is kept in `localStorage`, so it survives a reload. Being same-origin, pages that Infy Scroll appends inside an iframe load with the same state, and toggling propagates through the `storage` event.

## How it works

`content.js` looks for the text "Kindle版" and walks up from there to the smallest ancestor containing exactly one "注文番号" (order number) label, treats that element as the order card, and applies `display: none`. Because it never depends on class names, it holds up reasonably well against Amazon's markup changes. A MutationObserver re-runs the scan for infinite scroll and lazily rendered content.

Both Japanese strings are Amazon's own on-page wording, so they stay in Japanese.

## Working with Infy Scroll

Three measures keep it working past page one.

- `all_frames: true`, since Infy Scroll's Iframe and AJAX modes place appended pages inside an iframe
- Listening for AutoPagerize-style events such as `GM_AutoPagerizeLoaded`
- A rescan every 1.5 seconds as a fallback

If later pages still show Kindle orders, switching Infy Scroll's append mode to Element (AutoPagerize mode) makes it certain.

## Known limitations

- The order count ("390件の注文") comes from Amazon and does not change
- Paging is decided by Amazon, so each page shows fewer entries once orders are hidden
- An order containing a "Kindle版" item disappears entirely, even if the same order also holds a physical item
