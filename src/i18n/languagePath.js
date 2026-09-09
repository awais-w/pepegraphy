const LANGUAGE_PATH_PATTERN = /^\/(en|hu)(?=\/|$)/;

export function getLanguageFromPath(pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  const match = pathname.match(LANGUAGE_PATH_PATTERN);
  return match?.[1] ?? null;
}