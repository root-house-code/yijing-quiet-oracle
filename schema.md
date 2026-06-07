# Data schema

The data is split so that **the core is translation-independent** and each
translation is a pluggable layer keyed by hexagram number. This is what makes
"multiple toggleable translations" clean: switching a translation never touches
the structural core, and adding a translation is just dropping in one file.

## Line & trigram conventions
- A line is `1` (yang, solid ⚊) or `0` (yin, broken ⚋).
- A hexagram's `lines` array is **bottom → top**, indices 0–5 (line 1 … line 6).
- A trigram is the lower three lines `[l1,l2,l3]` and upper three `[l4,l5,l6]`.
- King Wen number is the canonical 1–64 ordering. It is the primary key everywhere.

## trigrams.json
Array of the 8 trigrams.
```json
{
  "id": "qian",
  "name_zh": "乾",
  "name_pinyin": "Qián",
  "name_en": "The Creative",
  "image": "Heaven",
  "attribute": "strong",
  "family": "father",
  "lines": [1, 1, 1]
}
```

## hexagrams.json  (the core — no interpretive text here)
Array of 64. Interpretive prose lives ONLY in translation files.
```json
{
  "king_wen": 1,
  "name_zh": "乾",
  "name_pinyin": "Qián",
  "name_en": "The Creative",          // conventional English label, not a translation of the Judgment
  "lines": [1, 1, 1, 1, 1, 1],         // bottom -> top
  "lower_trigram": "qian",
  "upper_trigram": "qian",
  "nuclear_lower": "qian",             // trigram from lines 2-3-4
  "nuclear_upper": "qian",             // trigram from lines 3-4-5
  "binary": "111111"                   // convenience key; lines bottom->top as a string
}
```

## translations/<id>.json  (one file per source)
A translation is a header of attribution + a map keyed by King Wen number.
```json
{
  "meta": {
    "id": "legge",
    "translator": "James Legge",
    "year": 1882,
    "source": "The Sacred Books of the East, Vol. XVI (The Yî King)",
    "license": "Public Domain",
    "language": "en",
    "note": "Victorian-era scholarly translation. Archaic diction preserved as-is; do not modernize."
  },
  "hexagrams": {
    "1": {
      "judgment": "…the Judgment text for hexagram 1…",
      "image": "…the Image (Da Xiang) text…",
      "lines": {
        "1": "Nine in the first place means: …",
        "2": "Nine in the second place means: …",
        "3": "…",
        "4": "…",
        "5": "…",
        "6": "…"
      }
    }
    // … through "64"
  }
}
```

### Rules for translation data (respect tenet 2)
- Reproduce source text faithfully; never paraphrase, abridge, or "improve" it.
- Every translation must carry full `meta` attribution and a real license field.
- Only bundle text that is clearly public domain or properly licensed for the
  target jurisdiction. **Legge (1882) is the safe seed.** Verify any other
  source's status before shipping it.
- Line commentary is keyed by line position 1–6. At read time, show commentary
  only for the lines that are *moving* in the cast.

## A reading object (runtime, persisted to journal if enabled)
```json
{
  "id": "uuid",
  "timestamp": "2026-06-05T17:00:00.000Z",
  "question": "optional string or null",
  "method": "yarrow",                  // or "coins"
  "authentic_yarrow": true,
  "line_values": [7, 8, 9, 8, 6, 7],   // the raw 6/7/8/9 per line, bottom->top
  "primary_king_wen": 5,
  "relating_king_wen": 47,             // null if no moving lines
  "translation_id": "legge"
}
```
Stored only in `localStorage`, only when journaling is enabled. Never transmitted.
