// Hides order cards that contain "Kindle版" on the Amazon.co.jp order history.
// Instead of relying on class names, an order card is taken to be the smallest
// ancestor that contains exactly one "注文番号" (order number) label, so the
// extension survives Amazon's markup changes.
// The two Japanese literals are Amazon's own on-page wording and must stay as is.

const KEYWORD = "Kindle版";
const CARD_MARKER = /注文番号/g;
const CARD_ATTR = "data-hide-kindle-card";
const BUTTON_ATTR = "data-hide-kindle-button";
const STATE_KEY = "hide-kindle-orders:hidden";
/** Where versions up to 1.1.3 kept the state, in Amazon's localStorage. */
const LEGACY_STATE_KEY = "hide-kindle-orders:hidden";
const MAX_DEPTH = 20;

/** Hiding is done with an attribute plus a stylesheet, so the toggle can simply
 * enable or disable the whole sheet. */
const sheet = document.createElement("style");

sheet.textContent = `[${CARD_ATTR}] { display: none !important; }`;
document.documentElement.appendChild(sheet);

/** Collects every text node that contains KEYWORD. */
function findKeywordNodes() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) =>
        node.nodeValue.includes(KEYWORD)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    },
  );
  const nodes = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  return nodes;
}

/**
 * Walks up from the starting node and returns the smallest ancestor holding the
 * order number label. Two or more matches means we went past a single card, so
 * nothing is returned in that case.
 */
function findCard(start) {
  let node = start.parentElement;

  for (let depth = 0; depth < MAX_DEPTH; depth += 1) {
    if (!node || node === document.body) break;

    const hits = (node.textContent.match(CARD_MARKER) || []).length;

    if (hits === 1) return node;
    if (hits > 1) return null;

    node = node.parentElement;
  }

  return null;
}

function markKindleOrders() {
  for (const textNode of findKeywordNodes()) {
    const card = findCard(textNode);

    if (!card || card.hasAttribute(CARD_ATTR)) continue;

    card.setAttribute(CARD_ATTR, "");
  }
}

// --- Toggle ---

/**
 * State lives in the extension's own storage rather than Amazon's localStorage,
 * so the page cannot read or clear it. storage.onChanged reaches every frame,
 * which keeps pages Infy Scroll appends inside an iframe in step with the top.
 */
let hidden = true;
let button = null;

function applyState() {
  sheet.disabled = !hidden;

  if (!button) return;

  button.textContent = hidden ? "Hide Kindle: On" : "Hide Kindle: Off";
}

/** Earlier versions kept the state in Amazon's localStorage. Copy it over once. */
function takeLegacyState() {
  try {
    const legacy = localStorage.getItem(LEGACY_STATE_KEY);

    if (legacy === null) return undefined;

    localStorage.removeItem(LEGACY_STATE_KEY);

    return legacy !== "false";
  } catch {
    return undefined;
  }
}

async function loadState() {
  try {
    const stored = await browser.storage.local.get(STATE_KEY);

    if (typeof stored[STATE_KEY] === "boolean") {
      hidden = stored[STATE_KEY];
    } else {
      const legacy = takeLegacyState();

      if (legacy !== undefined) {
        hidden = legacy;
        await browser.storage.local.set({ [STATE_KEY]: hidden });
      }
    }
  } catch {
    // Storage unavailable: keep the default, which hides the orders.
  }

  applyState();
}

if (window.top === window) {
  // The button styles need their own sheet: the card sheet gets disabled on toggle.
  const buttonSheet = document.createElement("style");

  buttonSheet.textContent = `
    [${BUTTON_ATTR}] {
      background: #232f3e;
      border: none;
      border-radius: 999px;
      bottom: 20px;
      color: #fff;
      cursor: pointer;
      font: 11px/1 sans-serif;
      min-width: 96px;
      opacity: 0.65;
      padding: 8px 12px;
      position: fixed;
      right: 20px;
      transition: opacity 0.15s ease;
      z-index: 2147483647;
    }
    [${BUTTON_ATTR}]:hover,
    [${BUTTON_ATTR}]:focus-visible {
      opacity: 1;
    }
  `;
  document.documentElement.appendChild(buttonSheet);

  button = document.createElement("button");
  button.type = "button";
  button.setAttribute(BUTTON_ATTR, "");
  button.addEventListener("click", () => {
    hidden = !hidden;
    applyState();
    browser.storage.local.set({ [STATE_KEY]: hidden }).catch(() => {
      // Not persisted; the toggle still applies to this page.
    });
  });
  document.body.appendChild(button);
}

applyState();
loadState();

// Follow toggles made in other frames.
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !(STATE_KEY in changes)) return;

  hidden = changes[STATE_KEY].newValue !== false;
  applyState();
});

// --- Startup and rescanning ---

/**
 * Amazon's container for the order list. Watching only this keeps the observer
 * quiet while ads and recommendations elsewhere on the page re-render. The ids
 * are a narrowing hint only: cards are still found by the order number label,
 * and the whole body is watched when none of them is present.
 */
const ORDER_CONTAINERS = [
  "#ordersContainer",
  "#yourOrdersContent",
  ".your-orders-content-container",
];
const RESCAN_DELAY = 200;
const FALLBACK_INTERVAL = 15000;

let timer = 0;

function schedule() {
  if (timer) return;

  timer = setTimeout(() => {
    timer = 0;
    markKindleOrders();
  }, RESCAN_DELAY);
}

markKindleOrders();

const container = document.querySelector(ORDER_CONTAINERS.join(","));

new MutationObserver(schedule).observe(container ?? document.body, {
  childList: true,
  subtree: true,
});

// Notifications from Infy Scroll and other AutoPagerize-style extensions when a
// next page is appended, possibly outside the watched container. CARD_ATTR keeps
// the work idempotent.
for (const eventName of [
  "GM_AutoPagerizeLoaded",
  "GM_AutoPagerizeNextPageLoaded",
  "AutoPagerize_DOMNodeInserted",
]) {
  window.addEventListener(eventName, schedule, false);
  document.addEventListener(eventName, schedule, false);
}

// With a narrowed observer, an infrequent full pass catches anything appended
// outside the container without an event.
if (container) setInterval(schedule, FALLBACK_INTERVAL);
