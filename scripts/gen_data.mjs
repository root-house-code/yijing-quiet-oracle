// gen_data.mjs — generate the translation-INDEPENDENT structural core.
// Writes src/data/trigrams.json and src/data/hexagrams.json.
//
// Only the canonical facts are hand-encoded: the 8 trigrams, and for each
// King Wen hexagram its name (zh/pinyin/en) and its lower+upper trigram.
// Everything else (lines, binary, nuclear trigrams) is COMPUTED, then the
// result is validated for uniqueness and self-consistency. Run:
//   npm run gen:data
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

// --- The eight trigrams (bottom -> top line arrays) ------------------------
const TRIGRAMS = [
  { id: 'qian', name_zh: '乾', name_pinyin: 'Qián', name_en: 'The Creative', image: 'Heaven', attribute: 'strong', family: 'father', lines: [1, 1, 1] },
  { id: 'dui', name_zh: '兌', name_pinyin: 'Duì', name_en: 'The Joyous', image: 'Lake', attribute: 'joyful', family: 'youngest daughter', lines: [1, 1, 0] },
  { id: 'li', name_zh: '離', name_pinyin: 'Lí', name_en: 'The Clinging', image: 'Fire', attribute: 'light-giving', family: 'middle daughter', lines: [1, 0, 1] },
  { id: 'zhen', name_zh: '震', name_pinyin: 'Zhèn', name_en: 'The Arousing', image: 'Thunder', attribute: 'inciting', family: 'eldest son', lines: [1, 0, 0] },
  { id: 'xun', name_zh: '巽', name_pinyin: 'Xùn', name_en: 'The Gentle', image: 'Wind/Wood', attribute: 'penetrating', family: 'eldest daughter', lines: [0, 1, 1] },
  { id: 'kan', name_zh: '坎', name_pinyin: 'Kǎn', name_en: 'The Abysmal', image: 'Water', attribute: 'dangerous', family: 'middle son', lines: [0, 1, 0] },
  { id: 'gen', name_zh: '艮', name_pinyin: 'Gèn', name_en: 'Keeping Still', image: 'Mountain', attribute: 'resting', family: 'youngest son', lines: [0, 0, 1] },
  { id: 'kun', name_zh: '坤', name_pinyin: 'Kūn', name_en: 'The Receptive', image: 'Earth', attribute: 'devoted', family: 'mother', lines: [0, 0, 0] },
];

const linesToId = new Map(TRIGRAMS.map((t) => [t.lines.join(''), t.id]));
const trigramOf = (a, b, c) => {
  const id = linesToId.get(`${a}${b}${c}`);
  if (!id) throw new Error(`No trigram for ${a}${b}${c}`);
  return id;
};

// --- King Wen sequence: [number, zh, pinyin, en, lowerTrigram, upperTrigram]
// lower = inner/near (lines 1-3), upper = outer/far (lines 4-6).
const KING_WEN = [
  [1, '乾', 'Qián', 'The Creative', 'qian', 'qian'],
  [2, '坤', 'Kūn', 'The Receptive', 'kun', 'kun'],
  [3, '屯', 'Zhūn', 'Difficulty at the Beginning', 'zhen', 'kan'],
  [4, '蒙', 'Méng', 'Youthful Folly', 'kan', 'gen'],
  [5, '需', 'Xū', 'Waiting (Nourishment)', 'qian', 'kan'],
  [6, '訟', 'Sòng', 'Conflict', 'kan', 'qian'],
  [7, '師', 'Shī', 'The Army', 'kan', 'kun'],
  [8, '比', 'Bǐ', 'Holding Together (Union)', 'kun', 'kan'],
  [9, '小畜', 'Xiǎo Chù', 'The Taming Power of the Small', 'qian', 'xun'],
  [10, '履', 'Lǚ', 'Treading (Conduct)', 'dui', 'qian'],
  [11, '泰', 'Tài', 'Peace', 'qian', 'kun'],
  [12, '否', 'Pǐ', 'Standstill (Stagnation)', 'kun', 'qian'],
  [13, '同人', 'Tóng Rén', 'Fellowship with Men', 'li', 'qian'],
  [14, '大有', 'Dà Yǒu', 'Possession in Great Measure', 'qian', 'li'],
  [15, '謙', 'Qiān', 'Modesty', 'gen', 'kun'],
  [16, '豫', 'Yù', 'Enthusiasm', 'kun', 'zhen'],
  [17, '隨', 'Suí', 'Following', 'zhen', 'dui'],
  [18, '蠱', 'Gǔ', 'Work on What Has Been Spoiled (Decay)', 'xun', 'gen'],
  [19, '臨', 'Lín', 'Approach', 'dui', 'kun'],
  [20, '觀', 'Guān', 'Contemplation (View)', 'kun', 'xun'],
  [21, '噬嗑', 'Shì Kè', 'Biting Through', 'zhen', 'li'],
  [22, '賁', 'Bì', 'Grace', 'li', 'gen'],
  [23, '剝', 'Bō', 'Splitting Apart', 'kun', 'gen'],
  [24, '復', 'Fù', 'Return (The Turning Point)', 'zhen', 'kun'],
  [25, '無妄', 'Wú Wàng', 'Innocence (The Unexpected)', 'zhen', 'qian'],
  [26, '大畜', 'Dà Chù', 'The Taming Power of the Great', 'qian', 'gen'],
  [27, '頤', 'Yí', 'The Corners of the Mouth (Nourishment)', 'zhen', 'gen'],
  [28, '大過', 'Dà Guò', 'Preponderance of the Great', 'xun', 'dui'],
  [29, '坎', 'Kǎn', 'The Abysmal (Water)', 'kan', 'kan'],
  [30, '離', 'Lí', 'The Clinging (Fire)', 'li', 'li'],
  [31, '咸', 'Xián', 'Influence (Wooing)', 'gen', 'dui'],
  [32, '恆', 'Héng', 'Duration', 'xun', 'zhen'],
  [33, '遯', 'Dùn', 'Retreat', 'gen', 'qian'],
  [34, '大壯', 'Dà Zhuàng', 'The Power of the Great', 'qian', 'zhen'],
  [35, '晉', 'Jìn', 'Progress', 'kun', 'li'],
  [36, '明夷', 'Míng Yí', 'Darkening of the Light', 'li', 'kun'],
  [37, '家人', 'Jiā Rén', 'The Family (The Clan)', 'li', 'xun'],
  [38, '睽', 'Kuí', 'Opposition', 'dui', 'li'],
  [39, '蹇', 'Jiǎn', 'Obstruction', 'gen', 'kan'],
  [40, '解', 'Xiè', 'Deliverance', 'kan', 'zhen'],
  [41, '損', 'Sǔn', 'Decrease', 'dui', 'gen'],
  [42, '益', 'Yì', 'Increase', 'zhen', 'xun'],
  [43, '夬', 'Guài', 'Break-through (Resoluteness)', 'qian', 'dui'],
  [44, '姤', 'Gòu', 'Coming to Meet', 'xun', 'qian'],
  [45, '萃', 'Cuì', 'Gathering Together (Massing)', 'kun', 'dui'],
  [46, '升', 'Shēng', 'Pushing Upward', 'xun', 'kun'],
  [47, '困', 'Kùn', 'Oppression (Exhaustion)', 'kan', 'dui'],
  [48, '井', 'Jǐng', 'The Well', 'xun', 'kan'],
  [49, '革', 'Gé', 'Revolution (Molting)', 'li', 'dui'],
  [50, '鼎', 'Dǐng', 'The Cauldron', 'xun', 'li'],
  [51, '震', 'Zhèn', 'The Arousing (Shock, Thunder)', 'zhen', 'zhen'],
  [52, '艮', 'Gèn', 'Keeping Still (Mountain)', 'gen', 'gen'],
  [53, '漸', 'Jiàn', 'Development (Gradual Progress)', 'gen', 'xun'],
  [54, '歸妹', 'Guī Mèi', 'The Marrying Maiden', 'dui', 'zhen'],
  [55, '豐', 'Fēng', 'Abundance (Fullness)', 'li', 'zhen'],
  [56, '旅', 'Lǚ', 'The Wanderer', 'gen', 'li'],
  [57, '巽', 'Xùn', 'The Gentle (Penetrating, Wind)', 'xun', 'xun'],
  [58, '兌', 'Duì', 'The Joyous (Lake)', 'dui', 'dui'],
  [59, '渙', 'Huàn', 'Dispersion (Dissolution)', 'kan', 'xun'],
  [60, '節', 'Jié', 'Limitation', 'dui', 'kan'],
  [61, '中孚', 'Zhōng Fú', 'Inner Truth', 'dui', 'xun'],
  [62, '小過', 'Xiǎo Guò', 'Preponderance of the Small', 'gen', 'zhen'],
  [63, '既濟', 'Jì Jì', 'After Completion', 'li', 'kan'],
  [64, '未濟', 'Wèi Jì', 'Before Completion', 'kan', 'li'],
];

const trigramLines = Object.fromEntries(TRIGRAMS.map((t) => [t.id, t.lines]));

const hexagrams = KING_WEN.map(([king_wen, name_zh, name_pinyin, name_en, lower, upper]) => {
  const lines = [...trigramLines[lower], ...trigramLines[upper]]; // bottom -> top
  const nuclear_lower = trigramOf(lines[1], lines[2], lines[3]); // lines 2-3-4
  const nuclear_upper = trigramOf(lines[2], lines[3], lines[4]); // lines 3-4-5
  return {
    king_wen,
    name_zh,
    name_pinyin,
    name_en,
    lines,
    lower_trigram: lower,
    upper_trigram: upper,
    nuclear_lower,
    nuclear_upper,
    binary: lines.join(''),
  };
});

// --- Validate before writing ----------------------------------------------
const errors = [];
if (hexagrams.length !== 64) errors.push(`Expected 64 hexagrams, got ${hexagrams.length}`);
const kwSet = new Set();
const binSet = new Set();
for (const h of hexagrams) {
  if (kwSet.has(h.king_wen)) errors.push(`Duplicate King Wen number ${h.king_wen}`);
  kwSet.add(h.king_wen);
  if (binSet.has(h.binary)) errors.push(`Duplicate binary ${h.binary} (King Wen ${h.king_wen})`);
  binSet.add(h.binary);
  if (h.binary.length !== 6) errors.push(`Bad binary length for ${h.king_wen}`);
}
for (let n = 1; n <= 64; n++) if (!kwSet.has(n)) errors.push(`Missing King Wen number ${n}`);
if (binSet.size !== 64) errors.push(`Only ${binSet.size} unique binaries (need 64)`);
// cross-check against the provided seed samples
const seedCheck = { 1: '111111', 2: '000000', 63: '101010' };
for (const [kw, bin] of Object.entries(seedCheck)) {
  const h = hexagrams.find((x) => x.king_wen === Number(kw));
  if (h.binary !== bin) errors.push(`Seed mismatch: King Wen ${kw} binary ${h.binary} != ${bin}`);
}

if (errors.length) {
  console.error('Data generation FAILED:\n - ' + errors.join('\n - '));
  process.exit(1);
}

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(join(DATA_DIR, 'trigrams.json'), JSON.stringify(TRIGRAMS, null, 2) + '\n');
writeFileSync(join(DATA_DIR, 'hexagrams.json'), JSON.stringify(hexagrams, null, 2) + '\n');
console.log(`Wrote ${TRIGRAMS.length} trigrams and ${hexagrams.length} hexagrams. All checks passed.`);
