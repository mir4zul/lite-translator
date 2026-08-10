function cacheKey(source, target, text) {
  return `${source}:${target}:${text}`;
}

function readCache(memoryCache, storage, key) {
  if (memoryCache.has(key)) return memoryCache.get(key);
  if (!storage) return undefined;

  try {
    const value = storage.getItem(`lite-translator:${key}`);
    if (value !== null) memoryCache.set(key, value);
    return value === null ? undefined : value;
  } catch {
    return undefined;
  }
}

function writeCache(memoryCache, storage, key, value) {
  memoryCache.set(key, value);
  if (!storage) return;

  try {
    storage.setItem(`lite-translator:${key}`, value);
  } catch {
    // Storage can be unavailable or full; memory caching still works.
  }
}

async function requestTranslations(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Translation request failed (${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data.translations)) {
    throw new TypeError("Translation endpoint must return { translations: string[] }");
  }
  return data.translations;
}

/** Create a small DOM translator backed by your secure server endpoint. */
export function createTranslator(options = {}) {
  const {
    sourceLanguage = "en",
    selector = "[data-lite-translate]",
    endpoint = "/api/translate",
    translate = (payload) => requestTranslations(endpoint, payload),
    storage = typeof localStorage === "undefined" ? null : localStorage,
    root = typeof document === "undefined" ? null : document
  } = options;

  let currentLanguage = sourceLanguage;
  const originals = new WeakMap();
  const memoryCache = new Map();

  async function changeLanguage(targetLanguage) {
    if (!root) throw new Error("A DOM root is required to translate a page");
    if (!targetLanguage) throw new TypeError("targetLanguage is required");

    const elements = [...root.querySelectorAll(selector)];
    const records = elements.map((element) => {
      if (!originals.has(element)) originals.set(element, element.textContent ?? "");
      return { element, text: originals.get(element) };
    });

    if (targetLanguage === sourceLanguage) {
      for (const { element, text } of records) element.textContent = text;
      currentLanguage = targetLanguage;
      return;
    }

    const missing = [];
    const unique = new Set();
    for (const { text } of records) {
      const key = cacheKey(sourceLanguage, targetLanguage, text);
      if (readCache(memoryCache, storage, key) === undefined && !unique.has(text)) {
        unique.add(text);
        missing.push(text);
      }
    }

    if (missing.length) {
      const translations = await translate({
        texts: missing,
        sourceLanguage,
        targetLanguage
      });
      if (!Array.isArray(translations) || translations.length !== missing.length) {
        throw new TypeError("Translator must return one translation for every text");
      }
      missing.forEach((text, index) => {
        writeCache(
          memoryCache,
          storage,
          cacheKey(sourceLanguage, targetLanguage, text),
          translations[index]
        );
      });
    }

    for (const { element, text } of records) {
      element.textContent = readCache(
        memoryCache,
        storage,
        cacheKey(sourceLanguage, targetLanguage, text)
      );
    }
    currentLanguage = targetLanguage;
  }

  function bind(trigger, targetLanguage) {
    const element = typeof trigger === "string" ? root?.querySelector(trigger) : trigger;
    if (!element) throw new Error("Language trigger was not found");
    const listener = () => changeLanguage(targetLanguage);
    element.addEventListener("click", listener);
    return () => element.removeEventListener("click", listener);
  }

  return {
    changeLanguage,
    bind,
    get language() {
      return currentLanguage;
    }
  };
}

export function clearTranslationCache(storage = typeof localStorage === "undefined" ? null : localStorage) {
  if (!storage) return;
  try {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith("lite-translator:")) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    // Ignore unavailable storage.
  }
}
