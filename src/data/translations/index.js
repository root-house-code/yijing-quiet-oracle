// Translation registry. A translation is a pluggable layer keyed by King Wen
// number over the stable hexagram core (schema.md). Adding a translation is
// just importing its file and listing it here — switching is live and never
// touches the structural core.
import legge from './legge.json';

export const translations = [legge];

export const translationsById = Object.fromEntries(translations.map((t) => [t.meta.id, t]));

export function getTranslation(id) {
  return translationsById[id] ?? legge;
}

/** Judgment/image/line texts for a hexagram in a given translation. */
export function hexagramText(translationId, kingWen) {
  const t = getTranslation(translationId);
  return t.hexagrams?.[kingWen] ?? null;
}
