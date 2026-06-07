# 易經 — A Quiet Oracle

A faithful, educational, and serene digital interface for consulting the *Yijing*
(Book of Changes) the traditional way: as a structured mirror for reflection, not a
fortune-telling gimmick. Fully client-side, offline, and free of tracking.

See [`CLAUDE.md`](CLAUDE.md) for the full build contract and philosophy, and
[`schema.md`](schema.md) for the data shape.

## Quick start

```bash
npm install
npm run dev        # start the app (Vite)
npm test           # run the test suite (Vitest)
npm run build      # production build → dist/
```

## What it does

- **Two casting methods**, both with correct math (verified at 1,000,000 trials per
  method in [`src/lib/casting.test.js`](src/lib/casting.test.js)):
  - **Three coins** — even odds (6 → 1/8, 7 → 3/8, 8 → 3/8, 9 → 1/8).
  - **Yarrow stalks** — the authentic *uneven* odds (6 → 1/16, 7 → 5/16, 8 → 7/16,
    9 → 3/16). This asymmetry is the point of yarrow, and is a documented toggle.
- **The casting is shown, not skipped** — line by line, bottom to top, with the actual
  coins or stalk-counts that produced each line. Deliberate pacing is on by default,
  always skippable, and respects `prefers-reduced-motion`.
- **The reading** — primary hexagram (glyph, name, pinyin, trigrams), the Judgment and
  Image, per-line commentary for moving lines only, and the relating hexagram showing
  where the situation is tending. Optional nuclear-trigram disclosure (off by default).
- **Live, pluggable translations** — switch translations within a reading without
  re-casting. The structural core is translation-independent.
- **Optional journal** — off by default; `localStorage` only; never transmitted; with
  JSON export and delete-all.
- **Educational throughout** — tooltips on every domain term and a "How this works" panel.

## Architecture

```text
src/
  lib/         casting.js (verbatim, verified) · hexagram.js (lookups, transforms,
               nuclear) · ritual.js (per-line evidence for the transparent UI)
  data/        hexagrams.json · trigrams.json (computed + validated) ·
               translations/legge.json · glossary.json
  state/       SettingsContext · JournalContext (both localStorage-backed)
  components/  Cast/ · Reading/ · Journal/ · Learn/ · Settings/ · Tooltip/
scripts/       gen_data.mjs · fetch_legge.mjs · validate_data.mjs · poll_and_fetch.mjs
```

Regenerate / validate the data:

```bash
npm run gen:data        # write the 64-hexagram + 8-trigram structural core
node scripts/fetch_legge.mjs   # assemble the full Legge translation (see below)
npm run validate:data   # gate: 8 trigrams, 64 hexagrams, Legge complete for all 64
```

## Translation provenance

The bundled translation is **James Legge (1882)**, *The Sacred Books of the East,
Vol. XVI — The Yî King* — unambiguously public domain. The English is reproduced
**verbatim** (no paraphrase, no modernization) from the digitisation hosted by the
[Chinese Text Project (ctext.org)](https://ctext.org/book-of-changes), retrieved via the
[Wayback Machine](https://web.archive.org/) (`scripts/fetch_legge.mjs`), with full
attribution shown in-app whenever the translation is active. Note: that digitisation
renders a handful of transliterated proper names with `?` and uses pinyin where Legge
printed older romanizations (e.g. "Qian" for "Khien"); this is disclosed in the
translation's `meta.note`. The text is bundled into the build — **the app makes no
network calls at runtime**; only this one-time build script touches the network. To add
a translation, drop a file in `src/data/translations/` and list it in `index.js` —
switching is live and never touches the structural core.

## License

The source code is released under the [MIT License](LICENSE). The bundled James
Legge (1882) translation is in the public domain and reproduced verbatim with
attribution; it is not covered by the MIT license.

## Principles (non-negotiable)

Educational & transparent · respectful & true-to-form · calm & serene. No analytics,
no network calls at runtime, no gamification, and never any invented or "modernized"
hexagram meanings. The app frames and explains; the attributed source text is the only
thing that speaks.
