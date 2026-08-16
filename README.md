# Lite Translator

A tiny, dependency-free browser translator for any frontend. It translates only
the elements you mark, loads a language on demand, and caches completed
translations in the browser.

Works with plain JavaScript, React, Vue, Svelte, Astro, and other browser-based
frontends. Your translation provider stays on your own secure backend.

## Choose one installation

There are three ways to use Lite Translator. Install only the option your app
needs. The names `lite-translator-mymemory` and `lite-translator-openai` are
reserved suggestions for future adapters; they are not published packages yet.

### Option 1 — Local / offline dictionary

Best for a small site with translations written by you. It has no API cost,
needs no internet, and installs no provider dependency.

```bash
npm install lite-translator
```

```js
import { createTranslator } from "lite-translator";

const dictionary = {
  bn: { "Add to cart": "কার্টে যোগ করুন" },
  es: { "Add to cart": "Añadir al carrito" }
};

const translator = createTranslator({
  sourceLanguage: "en",
  translate: async ({ texts, targetLanguage }) =>
    texts.map((text) => dictionary[targetLanguage]?.[text] ?? text)
});
```

### Option 2 — Free automatic translation

Best for a demo or a low-traffic site. The frontend still needs only the core
package; your backend calls a free provider such as MyMemory. Provider quota,
quality, internet access, and usage terms apply.

```bash
npm install lite-translator
```

```js
import { createTranslator } from "lite-translator";

const translator = createTranslator({
  sourceLanguage: "en",
  endpoint: "/api/translate/free"
});
```

Your backend can translate every missing text with MyMemory:

```js
async function translateFree({ texts, sourceLanguage, targetLanguage }) {
  return Promise.all(texts.map(async (text) => {
    const query = new URLSearchParams({
      q: text,
      langpair: `${sourceLanguage}|${targetLanguage}`
    });
    const response = await fetch(
      `https://api.mymemory.translated.net/get?${query}`
    );
    const data = await response.json();
    return data.responseData.translatedText;
  }));
}
```

Return its result as `{ "translations": [...] }` from `/api/translate/free`.

### Option 3 — Paid AI translation

Best when you need higher quality, longer text, tone preservation, and scalable
usage. Install the OpenAI SDK only on your backend—never in browser code that
could expose your API key.

```bash
# Frontend
npm install lite-translator

# Backend only
npm install openai
```

```js
// Backend code
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function translateWithAI({ texts, sourceLanguage, targetLanguage }) {
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    instructions: `Translate from ${sourceLanguage} to ${targetLanguage}. Return only the translations, one per line, in the original order.`,
    input: texts.join("\n")
  });

  return response.output_text.split("\n");
}
```

For production batch translation, use structured output or a delimiter-safe
adapter instead of relying on line splitting.

### Connect content and actions (all options)

Mark only the content you want translated:

```html
<h2 data-lite-translate>English product name</h2>
<p data-lite-translate>Soft cotton for everyday use.</p>
```

Then call the same translator action from plain JavaScript or any framework:

```js
document.querySelector("#bangla").onclick = () =>
  translator.changeLanguage("bn");
```

```jsx
<button onClick={() => translator.changeLanguage("bn")}>বাংলা</button>
```

```vue
<button @click="translator.changeLanguage('bn')">বাংলা</button>
```

## Backend contract

The package does not lock you into a provider. `/api/translate` can use
MyMemory, LibreTranslate, OpenAI, Google, DeepL, Azure, a local AI model, or your
own dictionary.

The browser sends:

```json
{
  "texts": ["English product name", "Soft cotton for everyday use."],
  "sourceLanguage": "en",
  "targetLanguage": "bn"
}
```

Your backend returns one translation for every input, in the same order:

```json
{
  "translations": ["ইংরেজি পণ্যের নাম", "প্রতিদিন ব্যবহারের জন্য নরম সুতি।"]
}
```

Keep provider API keys on the backend. Never put a secret API key in browser or
frontend environment variables.

## Limit translation to one page or component

Pass a DOM root so only that route or component is scanned:

```js
const translator = createTranslator({
  sourceLanguage: "en",
  endpoint: "/api/translate",
  root: document.querySelector("#current-page")
});
```

Only descendants of `#current-page` with `data-lite-translate` are sent. Cached
text does not create another provider request.

## Custom translation function

Use any client or adapter without changing the package:

```js
const translator = createTranslator({
  sourceLanguage: "en",
  translate: async ({ texts, sourceLanguage, targetLanguage }) => {
    const response = await fetch("/your-own-endpoint", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ texts, sourceLanguage, targetLanguage })
    });

    const data = await response.json();
    return data.translations;
  }
});
```

## API

- `createTranslator(options)` creates a translator.
- `changeLanguage(code)` translates marked content or restores the source text.
- `bind(elementOrSelector, code)` binds a click and returns an unbind function.
- `translator.language` returns the current language code.
- `clearTranslationCache()` removes cached translations.

## License

MIT
