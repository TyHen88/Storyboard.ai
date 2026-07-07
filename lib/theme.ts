// Theme is stored outside React (localStorage) and read via useSyncExternalStore
// so the server render stays 'light' without a hydration mismatch.
export const THEME_KEY = 'sb-theme';
export const THEME_EVENT = 'sb-theme-change';

export const subscribeTheme = (cb: () => void) => {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
};

export const readTheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
