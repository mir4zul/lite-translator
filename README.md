# Lite Translator

A tiny, dependency-free browser translator for any frontend. It translates only
the elements you mark, loads a language on demand, and caches completed
translations in the browser.

Works with plain JavaScript, React, Vue, Svelte, Astro, and other browser-based
frontends. Your translation provider stays on your own secure backend.

## Quick start — 3 steps

### 1. Install only the package

```bash
npm install lite-translator
```

`lite-translator` has no runtime dependencies. You do not need to install any
React, Vue, AI, or translation-provider package unless your own app needs it.

### 2. Mark only the text to translate

```html
<h2 data-lite-translate>English product name</h2>
<p data-lite-translate>Soft cotton for everyday use.</p>

<!-- This is not marked, so it stays unchanged. -->
<span>$24.00</span>
```

### 3. Connect your button, dropdown, or framework action

```js
import { createTranslator } from "lite-translator";

const translator = createTranslator({
  sourceLanguage: "en",
  endpoint: "/api/translate"
});

document.querySelector("#bangla").onclick = () =>
  translator.changeLanguage("bn");

document.querySelector("#english").onclick = () =>
  translator.changeLanguage("en");
```

You can also bind a DOM button directly:

```js
const unbind = translator.bind("#bangla", "bn");

// Call when the button/component is removed:
unbind();
```

In React, Vue, Svelte, or another framework, call the same action from the
framework event:

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
