import test from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../src/index.js";

function fixture(texts) {
  const elements = texts.map((textContent) => ({ textContent }));
  return {
    elements,
    root: { querySelectorAll: () => elements }
  };
}

test("translates marked content and restores the source language", async () => {
  const { elements, root } = fixture(["Shirt", "Soft cotton"]);
  const translator = createTranslator({
    root,
    storage: null,
    translate: async ({ texts, targetLanguage }) =>
      texts.map((text) => `${targetLanguage}:${text}`)
  });

  await translator.changeLanguage("bn");
  assert.deepEqual(elements.map((item) => item.textContent), ["bn:Shirt", "bn:Soft cotton"]);
  assert.equal(translator.language, "bn");

  await translator.changeLanguage("en");
  assert.deepEqual(elements.map((item) => item.textContent), ["Shirt", "Soft cotton"]);
});

test("deduplicates text and caches translations", async () => {
  const { root } = fixture(["Shirt", "Shirt"]);
  let calls = 0;
  const translator = createTranslator({
    root,
    storage: null,
    translate: async ({ texts }) => {
      calls += 1;
      assert.deepEqual(texts, ["Shirt"]);
      return ["শার্ট"];
    }
  });

  await translator.changeLanguage("bn");
  await translator.changeLanguage("bn");
  assert.equal(calls, 1);
});

test("rejects malformed translation responses", async () => {
  const { root } = fixture(["Shirt"]);
  const translator = createTranslator({ root, storage: null, translate: async () => [] });
  await assert.rejects(() => translator.changeLanguage("fr"), /one translation/);
});
