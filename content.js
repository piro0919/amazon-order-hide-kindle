// Amazon.co.jp の注文履歴で「Kindle版」を含む注文カードを非表示にする。
// クラス名の変更に耐えるよう、セレクタではなく「注文番号」を含む最小の祖先要素を
// 注文カードとみなす。

const KEYWORD = "Kindle版";
const CARD_MARKER = /注文番号/g;
const CARD_ATTR = "data-hide-kindle-card";
const STATE_KEY = "hide-kindle-orders:hidden";
const MAX_DEPTH = 20;

/** 非表示は属性＋スタイルシートで行い、トグルはシート単位で有効・無効を切り替える。 */
const sheet = document.createElement("style");

sheet.textContent = `[${CARD_ATTR}] { display: none !important; }`;
document.documentElement.appendChild(sheet);

/** KEYWORD を含むテキストノードを列挙する。 */
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
 * 起点から親をたどり、「注文番号」を含む最小の祖先を返す。
 * 「注文番号」が2件以上含まれる＝カードより大きい範囲なので、その場合は null。
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

// --- トグル ---

/** 状態は localStorage に保存する。同一オリジンなので iframe 側とも共有される。 */
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

  button.textContent = hidden ? "Kindle：非表示" : "Kindle：表示";
  button.style.background = hidden ? "#232f3e" : "#767676";
}

if (window.top === window) {
  button = document.createElement("button");
  button.type = "button";
  Object.assign(button.style, {
    border: "none",
    borderRadius: "999px",
    bottom: "20px",
    color: "#fff",
    cursor: "pointer",
    font: "12px/1 sans-serif",
    padding: "10px 14px",
    position: "fixed",
    right: "20px",
    zIndex: "2147483647",
  });
  button.addEventListener("click", () => {
    try {
      localStorage.setItem(STATE_KEY, String(!isHidden()));
    } catch {
      // プライベートウィンドウなどで書けない場合は切り替えが保存されない。
    }

    applyState();
  });
  document.body.appendChild(button);
}

applyState();

// 他フレームでの切り替えに追随する。storage は変更元のフレームには飛ばない。
window.addEventListener("storage", (event) => {
  if (event.key === STATE_KEY) applyState();
});

// --- 起動と再スキャン ---

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

// Infy Scroll / AutoPagerize 系が次ページを追加したときの通知。
// MutationObserver で拾えるケースと重複するが、二重処理は CARD_ATTR で防いでいる。
for (const eventName of [
  "GM_AutoPagerizeLoaded",
  "GM_AutoPagerizeNextPageLoaded",
  "AutoPagerize_DOMNodeInserted",
]) {
  window.addEventListener(eventName, schedule, false);
  document.addEventListener(eventName, schedule, false);
}

// 追加ページが Shadow DOM や独自の描画経路で入ってきた場合の保険。
setInterval(schedule, 1500);
