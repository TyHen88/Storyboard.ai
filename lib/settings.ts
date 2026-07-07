// The chosen AI model is stored outside React (localStorage) and read via
// useSyncExternalStore — same pattern as lib/theme.ts — so the server render
// uses the default without a hydration mismatch.

// v2: reset anyone previously stuck on the slow/unreliable gemini-3.5-flash
// default to the reliable gemini-2.5-flash.
export const MODEL_KEY = 'sb-model-v2';
export const MODEL_EVENT = 'sb-model-change';

export interface ModelOption {
  id: string;
  label: string;
  hint: string;
}

/**
 * Models offered in the settings dialog. The first is the default. If a chosen
 * model is unavailable at request time, lib/gemini.ts falls back to the
 * known-good ones automatically, so listing an occasionally-unavailable model
 * is safe.
 */
export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', hint: 'Fast and reliable — recommended' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', hint: 'Slower, highest quality' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', hint: 'Newest — can be slow or unavailable in some regions' },
];

export const DEFAULT_MODEL = MODEL_OPTIONS[0].id;

const isKnownModel = (id: string | null): id is string =>
  !!id && MODEL_OPTIONS.some((m) => m.id === id);

export const subscribeModel = (cb: () => void) => {
  window.addEventListener(MODEL_EVENT, cb);
  return () => window.removeEventListener(MODEL_EVENT, cb);
};

export const readModel = (): string => {
  try {
    const saved = localStorage.getItem(MODEL_KEY);
    if (isKnownModel(saved)) return saved;
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_MODEL;
};

export const writeModel = (id: string) => {
  try {
    localStorage.setItem(MODEL_KEY, id);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(MODEL_EVENT));
};
