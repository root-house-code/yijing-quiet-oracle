# Build order for Claude Code

Work in this sequence. Each step has a clear done-state; don't move on until met.
Read `CLAUDE.md` (the full spec) and `schema.md` first.

## Phase 0 — Scaffold
- `npm create vite@latest . -- --template react` (JavaScript).
- Add minimal deps. Framer Motion optional for the casting animation.
- Set up the folder structure from CLAUDE.md §2.
- Wire prefers-reduced-motion detection into a shared hook.

## Phase 1 — Casting engine (do this before any UI)
- Port `casting-reference.js` verbatim into `src/lib/casting.js`.
- Add `src/lib/hexagram.js`: `linesToHexagram`, King Wen lookup by binary string,
  trigram lookup, transform-to-relating, nuclear trigram derivation.
- Write a test (Vitest) that runs each method ≥1,000,000× and asserts the
  per-line frequencies are within ±0.005 of the §3 tables. THIS GATES THE PROJECT.
- Done when: tests pass and a `castReading()` call returns sane primary/relating.

## Phase 2 — Complete the data
- Expand `seed/trigrams.json` → `src/data/trigrams.json` (already complete: 8).
- Expand `seed/hexagrams.seed.json` → all 64 in `src/data/hexagrams.json`.
  The structural fields (trigrams, nuclear, binary) can be COMPUTED — reuse the
  logic in `gen_seed.mjs` to generate them rather than hand-typing, then verify
  every binary maps to a unique King Wen number 1–64.
- Expand `seed/translations/legge.seed.json` → full 64-hexagram `legge.json`
  from a verified public-domain edition. Faithful reproduction; full attribution.
- Done when: 64 hexagrams, 8 trigrams, one complete attributed translation;
  a validation script confirms no missing/duplicate King Wen numbers and every
  hexagram has judgment + image + 6 line texts.

## Phase 3 — The casting ritual UI
- Method picker (yarrow / coins) with explanatory tooltips.
- Question field (optional).
- Animated, transparent, bottom-to-top line generation. Deliberate pacing ON by
  default, skippable, reduced-motion aware (CLAUDE.md §4).
- Each finished line labeled with value + name + tooltip.
- Done when: a full reading can be cast end-to-end with the process visible.

## Phase 4 — The reading view
- Primary hexagram: glyph, name, pinyin, lines (moving lines marked tastefully),
  constituent trigrams with natural images.
- Judgment + Image in active translation; live translation switcher.
- Per-moving-line commentary (only for lines that moved).
- Relating hexagram when moving lines exist, with a gentle "tending toward" note.
- Optional advanced disclosure: nuclear trigrams (off by default).
- Done when: every reading renders correctly for 0, 1, and 6 moving lines.

## Phase 5 — Journal (optional feature)
- Settings toggle, off by default. localStorage only.
- Save reading object (schema.md). Chronological diary view.
- Export-JSON and delete-all controls.
- Done when: toggling on/off, saving, exporting, and wiping all work; nothing
  is persisted while the toggle is off.

## Phase 6 — Learn & polish
- "How this works" panel + glossary (see `glossary.seed.json`).
- Settings: yarrow authenticity toggle (documented), pacing toggle, journal toggle,
  coin-convention toggle, translation default.
- Accessibility pass: keyboard nav, ARIA, focus order, contrast.
- Serenity pass: spacing, motion timing, palette, optional subtle sound (off by default).
- Done when: the acceptance checklist in CLAUDE.md §9 is fully satisfied.

## Guardrails (apply throughout)
- Never invent or "modernize" hexagram meanings. Translations are reproduced, attributed.
- No analytics, no tracking, no network calls. Fully static and local.
- No gamification. Calm over engagement, always.
