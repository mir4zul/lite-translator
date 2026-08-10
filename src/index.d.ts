export interface TranslationPayload {
  texts: string[];
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslatorOptions {
  sourceLanguage?: string;
  selector?: string;
  endpoint?: string;
  translate?: (payload: TranslationPayload) => Promise<string[]>;
  storage?: Storage | null;
  root?: ParentNode | null;
}

export interface Translator {
  readonly language: string;
  changeLanguage(targetLanguage: string): Promise<void>;
  bind(trigger: string | Element, targetLanguage: string): () => void;
}

export declare function createTranslator(options?: TranslatorOptions): Translator;
export declare function clearTranslationCache(storage?: Storage | null): void;
