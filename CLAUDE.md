# 易經 — I Ching: A Quiet Oracle

A faithful, educational, and serene digital interface for consulting the *Yijing*
(Book of Changes) the way it has traditionally been used: as a structured mirror
for reflection, not a fortune-telling gimmick.

This document is the build contract. Read it fully before writing code.

---

## 1. Philosophy of the build (non-negotiable)

This project has three core tenets. Every implementation decision should be
checked against them. If a feature conflicts with a tenet, the tenet wins.

### Tenet 1 — Educational & transparent
A complete newcomer must be able to use the app comfortably and *learn the
tradition by using it*. The mechanics are never hidden behind a "magic" black box.

- The casting process is **shown, not skipped**. When yarrow stalks are divided
  or coins are tossed, the user sees it happen, line by line, bottom to top.
- Hover/tap tooltips explain every term the moment it appears: *yang line*,
  *yin line*, *moving/changing line*, *trigram*, *hexagram*, *the Judgment*,
  *the Image*, *nuclear trigram*, etc. Never assume prior knowledge.
- A short, honest "How this works" panel is always one tap away.

### Tenet 2 — Respectful & true-to-form
We honor the tradition. We do **not** embellish it, white-wash it, modernize its
meaning into self-help pablum, or water down its strangeness.

- Use established scholarly framing. Present the text as what it is: an ancient
  divinatory and wisdom text with layers of commentary added over centuries.
- Do **not** invent hexagram meanings or "modern interpretations" that
  overwrite the source. Translations are presented as translations, attributed.
- Keep the cosmology intact: yin/yang, the trigrams and their natural images,
  the King Wen sequence, moving lines producing a second hexagram.
- No horoscope-style padding, no "the universe wants you to..." voice.
  The text speaks for itself; the app gets out of the way.

### Tenet 3 — Simplicity & serenity
Using the app should feel calm, deliberate, and transformative — closer to a tea
ceremony than a slot machine.

- Generous negative space. Slow, soft transitions. Restrained palette.
  No notifications, no streaks, no gamification, no dark patterns.
- Sound is optional and off by default; if present, it is subtle (a single soft
  tone per cast at most).
- Deliberate pacing is a feature, not a loading bug — see §4.

---

## 2. Tech stack

- **React + Vite** (JavaScript, not TypeScript — keep the barrier low for contributors).
- No backend. Fully client-side; deployable as a static site.
- State persistence (journal, settings) via `localStorage` only.
- Keep dependencies minimal. A small animation lib (e.g. Framer Motion) is fine;
  avoid heavyweight UI kits that fight the aesthetic.
- Accessible by default: keyboard navigable, ARIA on interactive elements,
  prefers-reduced-motion respected (this also satisfies "skippable pacing").

Suggested structure:
```
src/
  data/
    hexagrams.json        # 64 hexagrams, full data (see schema §5)
    trigrams.json         # 8 trigrams
    translations/         # one file per translation source
  lib/
    casting.js            # yarrow + coin algorithms (see §3, §4)
    hexagram.js           # line arrays -> hexagram lookup, transforms, nuclear
  components/
    Cast/                 # the casting ritual UI
    Reading/              # hexagram display, judgment, image, moving lines
    Journal/              # optional saved readings
    Learn/                # "How this works" + glossary
    Tooltip/              # reusable educational tooltip
  state/                  # settings + journal (localStorage-backed)
```

---

## 3. The casting engine — correctness matters

This is the heart of the app and the easiest thing to get subtly wrong.
A reading is **six lines, generated bottom (line 1) to top (line 6)**.
Each line resolves to one of four values:

| Value | Name        | Line drawn | Moving? | Becomes |
|-------|-------------|------------|---------|---------|
| 6     | old yin     | broken ⚋   | yes     | yang    |
| 7     | young yang  | solid  ⚊   | no      | —       |
| 8     | young yin   | broken ⚋   | no      | —       |
| 9     | old yang    | solid  ⚊   | yes     | yin     |

If any line is **moving** (6 or 9), the reading produces a **primary hexagram**
(lines as drawn) and a **relating/transformed hexagram** (each moving line
flipped to its opposite). Non-moving readings have only the primary.

Implement BOTH methods. The user chooses per-reading.

### Coin method (three coins)
Three coins, six times. Conventionally heads = 3, tails = 2 (let the toggle in
settings allow the reverse, since traditions differ — but document the default).
Sum of three coins → line value:

| Sum | Combination        | Value |
|-----|--------------------|-------|
| 6   | T T T              | 6 old yin |
| 7   | two T, one H       | 7 young yang |
| 8   | two H, one T       | 8 young yin |
| 9   | H H H              | 9 old yang |

Coin probabilities (each line): 6 → 1/8, 7 → 3/8, 8 → 3/8, 9 → 1/8.

### Yarrow-stalk method (50 stalks)
Implement the authentic ritual numerically. The classic procedure: 50 stalks,
one set aside, the remaining 49 divided and counted through **three rounds** per
line; the remainders accumulate so that each line is one of 6/7/8/9 with the
*unequal* probabilities below.

Authentic yarrow probabilities (each line):
- 6 old yin   → 1/16
- 7 young yang→ 5/16
- 8 young yin → 7/16
- 9 old yang  → 3/16

**This asymmetry is the whole point** of yarrow vs coins — old yang and old yin
are rarer, so moving lines (and especially changing toward yin) carry weight.
See §4 for how this becomes a documented toggle.

---

## 4. The two toggles you must build (per the project owner)

1. **Yarrow probability authenticity toggle** (Settings, default ON):
   - ON  → yarrow casting uses the true 1/16, 5/16, 7/16, 3/16 distribution.
   - OFF → yarrow uses simplified equal-ish odds (matching coins' 1/8,3/8,3/8,1/8).
   - The toggle must carry a short tooltip explaining *what* it changes and *why*
     the authentic version is asymmetric. Default to authentic; let the user
     opt into the simplified model knowingly. Never silently fake the math.

2. **Deliberate pacing, skippable** (Settings, default ON):
   - ON  → the casting animation plays at a slow, meditative pace: each of the
     six lines is generated with a visible, unhurried beat (e.g. yarrow shows
     the bundle being split and counted across its three rounds; coins show the
     toss and settle). A "Skip the pause" affordance is always present and
     honored immediately.
   - OFF → lines resolve quickly but the process is **still shown** (transparency
     tenet) — "fast" never means "hidden."
   - `prefers-reduced-motion` forces the reduced/quick path automatically.

---

## 5. Data: multiple toggleable translations

The reading text must support **multiple translations, switchable live** without
re-casting. Architect the data so a translation is a pluggable layer over a
stable hexagram core.

### Source guidance (respect tenet 2)
- Ship at least one **public-domain** translation to start. The Wilhelm/Baynes
  English (via Cary Baynes) is the most famous but check its copyright status in
  the target jurisdiction before bundling — the Richard Wilhelm German (1924) and
  older English renderings such as **James Legge (1882, public domain)** are safe.
  **Legge is the recommended seed translation** — unambiguously public domain.
- Each translation file is fully attributed: translator, year, source edition,
  license. Show this attribution in the UI when that translation is active.
- Do **not** paraphrase or "improve" source text. If a fresh modern translation
  is later commissioned, it lives as its own attributed layer, not a rewrite of
  an existing one.
- The core (King Wen number, Chinese name, pinyin, trigram composition, line
  positions) is translation-independent and lives in `hexagrams.json`.

See `schema.md` for the exact shape. A 1-hexagram seed sample is provided in
`hexagrams.seed.json` and `translations/legge.seed.json` so the contract is
concrete — Claude Code should expand these to all 64 (and 8 trigrams).

---

## 6. The reading experience (screen flow)

1. **Threshold / home** — quiet landing. A single invitation: *"Bring a question
   to mind."* Brief, optional guidance on *how* to frame a question (open-ended,
   sincere — not yes/no fishing). One action: *Begin*.

2. **Pose the question** — a text field (the question is optional but encouraged;
   it is saved with the reading only if journaling is on). Choose method:
   *Yarrow stalks* or *Three coins*, each with a one-line tooltip on what it is
   and how they differ.

3. **The casting** — the visible ritual, line by line, bottom to top (see §4).
   Each completed line is labeled with its value (6/7/8/9) and name, with a
   tooltip. The hexagram assembles before the user's eyes.

4. **The reading** —
   - Primary hexagram: number, Chinese glyph + name + pinyin, the six lines
     (moving lines clearly but tastefully marked), constituent trigrams (with
     their natural images: Heaven, Lake, Fire, Thunder, Wind, Water, Mountain, Earth).
   - The Judgment and the Image, in the active translation.
   - Commentary for **each moving line** present in the cast (and only those).
   - If moving lines exist: the relating/transformed hexagram, with a clear,
     gentle explanation that this shows where the situation is *tending*.
   - Translation switcher (live).
   - Optional: nuclear trigrams / hexagram as an "advanced" disclosure, off by default.

5. **Close** — option to save to journal (if enabled), or simply let it go.
   No "share to social," no score.

---

## 7. Journal (optional, user-toggled)

- Off by default. A settings toggle enables local journaling.
- When on, a saved reading stores: timestamp, the question (if given), method
  used, the six line values, primary + relating hexagram numbers, and the
  translation active at save. Stored in `localStorage`; never transmitted.
- Journal view lists past readings chronologically with a calm, diary-like feel.
- Provide explicit **export (JSON)** and **delete all** controls. The user owns
  their data and can take it or erase it at will.

---

## 8. Tone & copy guidelines

- Voice is plain, warm, and unhurried. Explanatory, never preachy or mystical-
  marketing. When in doubt, describe rather than declare.
- Do not put words in the oracle's mouth. The app frames and explains; the
  translated source text is the only thing that "speaks."
- Glossary entries are short, accurate, and link concepts together.

---

## 9. Definition of done (acceptance checklist)

- [ ] Both casting methods implemented; coin math and authentic yarrow math correct.
- [ ] Yarrow authenticity toggle works and is documented in-UI.
- [ ] Deliberate-pacing toggle works, is skippable, and respects reduced-motion.
- [ ] All 64 hexagrams + 8 trigrams present with correct King Wen data & trigram composition.
- [ ] At least one fully attributed public-domain translation (Legge) complete for all 64.
- [ ] Translation layer is pluggable; switching is live and non-destructive.
- [ ] Moving lines correctly produce the relating hexagram; per-line commentary shown only for moving lines.
- [ ] Educational tooltips on every domain term; "How this works" panel present.
- [ ] Optional journal with export + delete-all; off by default; local only.
- [ ] Keyboard accessible, ARIA-labeled, prefers-reduced-motion honored.
- [ ] No gamification, tracking, or embellishment of the source text.

---

## 10. Verifying your casting math (do this)

Write a quick test that runs each method ~1,000,000 times and confirms the
per-line frequencies converge to the tables in §3. This is the single most
important correctness check in the project. See `casting-reference.md`.
