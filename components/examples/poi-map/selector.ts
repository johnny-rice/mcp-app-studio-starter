const SELECTOR_ESCAPE_RE = /["\\#]/g;

export function escapeSelectorValue(value: string): string {
  if (
    typeof globalThis.CSS !== "undefined" &&
    typeof globalThis.CSS.escape === "function"
  ) {
    return globalThis.CSS.escape(value);
  }

  return value.replace(SELECTOR_ESCAPE_RE, "\\$&");
}

export function buildPoiIdSelector(poiId: string): string {
  return `[data-poi-id="${escapeSelectorValue(poiId)}"]`;
}
