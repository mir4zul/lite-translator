# Lite Translator

A tiny, dependency-free browser translator. It lazy-loads only the language a visitor chooses and caches translated product content.

## Install

```bash
npm install lite-translator
```

## Browser usage

Mark only the content you want translated:

```html
<h2 data-lite-translate>English product name</h2>
<p data-lite-translate>Product description</p>
<button id="bangla">বাংলা</button>
```

```js
import { createTranslator } from "lite-translator";

const translator = createTranslator({
  sourceLanguage: "en",
  endpoint: "/api/translate"
});

translator.bind("#bangla", "bn");
```

Your server endpoint receives:

```json
{
  "texts": ["English product name", "Product description"],
  "sourceLanguage": "en",
  "targetLanguage": "bn"
}
```

It must return translations in the same order:

```json
{
  "translations": ["ইংরেজি পণ্যের নাম", "পণ্যের বিবরণ"]
}
```

Keep provider API keys on the server, never in browser code. To support one or many languages, add one button per language and call `bind`, or call `changeLanguage(code)` from your own dropdown. Language data is requested on demand rather than bundled.

## Custom translation function

Framework and backend adapters can provide a custom function:

```js
const translator = createTranslator({
  translate: async ({ texts, sourceLanguage, targetLanguage }) => {
    const result = await yourClient.translate(texts, sourceLanguage, targetLanguage);
    return result;
  }
});
```

## License

MIT
