// Runs content.js against a sanitized copy of the order history and checks
// which elements it marks as Kindle order cards.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { JSDOM } from "jsdom";

const CARD_ATTR = "data-hide-kindle-card";
const script = readFileSync(new URL("../content.js", import.meta.url), "utf8");
const fixture = readFileSync(
  new URL("./fixtures/order-history.html", import.meta.url),
  "utf8",
);

/** A stand-in for the WebExtension storage API the content script uses. */
function fakeBrowser(initial = {}) {
  const data = { ...initial };

  return {
    data,
    storage: {
      local: {
        get: async (key) => (key in data ? { [key]: data[key] } : {}),
        set: async (items) => Object.assign(data, items),
      },
      onChanged: { addListener: () => {} },
    },
  };
}

function load({ stored, legacy } = {}) {
  const dom = new JSDOM(fixture, {
    runScripts: "outside-only",
    url: "https://www.amazon.co.jp/your-orders/orders",
  });
  const browser = fakeBrowser(stored);

  if (legacy !== undefined) {
    dom.window.localStorage.setItem("hide-kindle-orders:hidden", legacy);
  }

  dom.window.browser = browser;
  dom.window.eval(script);

  return { browser, dom, document: dom.window.document };
}

const marked = (document) =>
  [...document.querySelectorAll(`[${CARD_ATTR}]`)].map(
    (element) => element.dataset.testid ?? element.id,
  );

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

test("marks only the order cards that hold a Kindle item", (t) => {
  const { dom, document } = load();

  t.after(() => dom.window.close());

  assert.deepEqual(marked(document), ["kindle", "kindle-nested"]);
});

test("leaves the Kindle text outside any order card alone", (t) => {
  const { dom, document } = load();

  t.after(() => dom.window.close());

  assert.equal(document.querySelector("#rhf").hasAttribute(CARD_ATTR), false);
  assert.equal(document.querySelector("#navbar").hasAttribute(CARD_ATTR), false);
});

test("does not hide the container that holds every card", (t) => {
  const { dom, document } = load();

  t.after(() => dom.window.close());

  const container = document.querySelector(".your-orders-content-container");

  assert.equal(container.hasAttribute(CARD_ATTR), false);
});

test("marks cards appended later, as infinite scroll does", async (t) => {
  const { dom, document } = load();

  t.after(() => dom.window.close());

  const container = document.querySelector(".your-orders-content-container");
  const appended = container
    .querySelector('[data-testid="kindle"]')
    .cloneNode(true);

  appended.removeAttribute(CARD_ATTR);
  appended.dataset.testid = "appended";
  container.append(appended);

  await new Promise((resolve) => setTimeout(resolve, 400));

  assert.deepEqual(marked(document), ["kindle", "kindle-nested", "appended"]);
});

test("moves the state out of Amazon's localStorage once", async (t) => {
  const { browser, dom } = load({ legacy: "false" });

  t.after(() => dom.window.close());
  await settle();

  assert.equal(browser.data["hide-kindle-orders:hidden"], false);
  assert.equal(dom.window.localStorage.getItem("hide-kindle-orders:hidden"), null);
});
