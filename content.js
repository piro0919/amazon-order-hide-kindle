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

/** State lives in localStorage, which is shared with same-origin iframes. */
function isHidden() {
  try {
    return localStorage.getItem(STATE_KEY) !== "false";
  } catch {
    return true;
  }
}

let button = null;

function applyState() {
  const hidden = isHidden();

  sheet.disabled = !hidden;

  if (!button) return;

  button.textContent = hidden ? "Kindle: hidden" : "Kindle: shown";
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
      font: 12px/1 sans-serif;
      opacity: 0.65;
      padding: 10px 14px;
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
    try {
      localStorage.setItem(STATE_KEY, String(!isHidden()));
    } catch {
      // Private windows may refuse writes; the toggle then just isn't persisted.
    }

    applyState();
  });
  document.body.appendChild(button);
}

applyState();

// Follow toggles made in other frames. The storage event skips its own frame.
window.addEventListener("storage", (event) => {
  if (event.key === STATE_KEY) applyState();
});

// --- Startup and rescanning ---

let scheduled = false;

function schedule() {
  if (scheduled) return;

  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    markKindleOrders();
  });
}

markKindleOrders();

new MutationObserver(schedule).observe(document.body, {
  childList: true,
  subtree: true,
});

// Notifications from Infy Scroll and other AutoPagerize-style extensions when a
// next page is appended. This overlaps with the MutationObserver, but CARD_ATTR
// keeps the work idempotent.
for (const eventName of [
  "GM_AutoPagerizeLoaded",
  "GM_AutoPagerizeNextPageLoaded",
  "AutoPagerize_DOMNodeInserted",
]) {
  window.addEventListener(eventName, schedule, false);
  document.addEventListener(eventName, schedule, false);
}

// Fallback for appended pages that arrive through a shadow root or some other
// path the observer cannot see.
setInterval(schedule, 1500);
