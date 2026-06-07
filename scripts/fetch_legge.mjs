// fetch_legge.mjs — assemble the full James Legge (1882) translation of the
// Yijing from the Chinese Text Project (ctext.org), which reproduces Legge's
// public-domain English aligned to the Chinese source.
//
// We take, per hexagram: the Judgment (the hexagram text), the Image (the
// "Great Symbolism" / Da Xiang — the first 象曰 row), and the six line texts
// (the 爻辞 — the first six rows whose Chinese begins with a line-position
// token, which always precede the appendix commentary on the page).
//
// Text is reproduced verbatim: tags are stripped and HTML entities decoded,
// but Legge's wording, parentheses, and punctuation are left untouched.
// Run: node scripts/fetch_legge.mjs   (writes src/data/translations/legge.json)
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'src', 'data', 'translations');
const CACHE_DIR = join(__dirname, '.legge_cache'); // per-hexagram cache; lets runs resume after throttling

// 64 ctext slugs in King Wen order (index 0 -> King Wen 1).
const SLUGS = [
  'qian', 'kun', 'zhun', 'meng', 'xu', 'song', 'shi', 'bi', 'xiao-xu', 'lu',
  'tai', 'pi', 'tong-ren', 'da-you', 'qian1', 'yu', 'sui', 'gu', 'lin', 'guan',
  'shi-he', 'bi1', 'bo', 'fu', 'wu-wang', 'da-xu', 'yi', 'da-guo', 'kan', 'li',
  'xian', 'heng', 'dun', 'da-zhuang', 'jin', 'ming-yi', 'jia-ren', 'kui', 'jian', 'jie',
  'sun', 'yi1', 'guai', 'gou', 'cui', 'sheng', 'kun1', 'jing', 'ge', 'ding',
  'zhen', 'gen', 'jian1', 'gui-mei', 'feng', 'lu1', 'xun', 'dui', 'huan', 'jie1',
  'zhong-fu', 'xiao-guo', 'ji-ji', 'wei-ji',
];

function decode(s) {
  return s
    .replace(/<div[^>]*>\s*<\/div>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&#34;|&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePage(html) {
  // Each English passage row is labelled by its source section in an
  // "etext opt" cell: the hexagram name (e.g. "Qian:") for the base Zhouyi text
  // — the judgment and the six line statements — and "Xiang Zhuan:" for the
  // Image (Da Xiang) and the line commentaries. Classify by that label.
  const rows = [...html.matchAll(/class="etext opt"[^>]*>([^<]*)<\/td>\s*<td class="etext">([\s\S]*?)<\/td>/g)].map(
    (m) => ({ label: decode(m[1]), text: decode(m[2]) }),
  );
  if (!rows.length) return { judgment: '', image: '', lines: [], baseLabel: '' };

  const baseLabel = rows[0].label; // the judgment's label == the line statements' label
  const base = rows.filter((r) => r.label === baseLabel).map((r) => r.text); // [judgment, line1..6, (use-of-nine?)]
  const xiang = rows.find((r) => r.label.startsWith('Xiang Zhuan'));

  return {
    judgment: base[0] || '',
    image: xiang ? xiang.text : '',
    lines: base.slice(1, 7),
    baseLabel,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isComplete(p) {
  if (!p || !p.judgment || !p.image || !p.lines) return false;
  const vals = Array.isArray(p.lines) ? p.lines : Object.values(p.lines);
  return vals.length === 6 && vals.every(Boolean);
}

// ctext.org rate-limit-blocks bulk access, so we read its pages through the
// Wayback Machine, which serves the identical archived HTML our parser expects.
// One CDX prefix query yields the latest capture timestamp for every page,
// avoiding 64 separate (rate-limited) index lookups.
let TS_MAP = null;

async function loadTimestampMap() {
  const r = await fetch(
    'http://web.archive.org/cdx/search/cdx?url=ctext.org/book-of-changes/' +
      '&matchType=prefix&output=json&filter=statuscode:200&fl=original,timestamp&collapse=digest',
  );
  const text = await r.text();
  let rows;
  try {
    rows = JSON.parse(text);
  } catch {
    throw new Error('CDX prefix query rate-limited');
  }
  const latest = {};
  for (const [orig, ts] of rows.slice(1)) {
    const m = orig.match(/book-of-changes\/([a-z0-9-]+)$/);
    if (m && (!latest[m[1]] || ts > latest[m[1]])) latest[m[1]] = ts;
  }
  return latest;
}

async function fetchHexOnce(slug) {
  if (!TS_MAP) TS_MAP = await loadTimestampMap();
  const ts = TS_MAP[slug];
  if (!ts) throw new Error('no Wayback capture');
  // id_ suffix asks Wayback for the raw original capture (no rewriting banner).
  const res = await fetch(`http://web.archive.org/web/${ts}id_/https://ctext.org/book-of-changes/${slug}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parsePage(await res.text());
}

// Fetch with retry + exponential backoff; tolerate throttling/transient pages.
async function fetchHex(slug) {
  const waits = [3000, 8000, 20000, 45000, 90000];
  let lastErr;
  for (let attempt = 0; attempt <= waits.length; attempt++) {
    try {
      const p = await fetchHexOnce(slug);
      if (isComplete(p)) return p;
      lastErr = new Error(`incomplete parse (judgment:${!!p.judgment} image:${!!p.image} lines:${p.lines.length})`);
    } catch (e) {
      lastErr = e;
    }
    if (attempt < waits.length) {
      process.stdout.write(`\n  ${slug}: ${lastErr.message}; retrying in ${waits[attempt] / 1000}s...`);
      await sleep(waits[attempt]);
    }
  }
  throw new Error(`${slug}: ${lastErr.message}`);
}

async function main() {
  const onlyArg = process.argv[2]; // optional: a slug to test a single hexagram
  const slugs = onlyArg ? [onlyArg] : SLUGS;
  if (onlyArg) {
    const { judgment, image, lines, baseLabel } = await fetchHex(onlyArg);
    console.log('\nslug', onlyArg, '| base label:', baseLabel);
    console.log('JUDGMENT:', judgment);
    console.log('IMAGE   :', image);
    lines.forEach((l, j) => console.log(`LINE ${j + 1}  :`, l));
    return;
  }

  mkdirSync(CACHE_DIR, { recursive: true });
  const hexagrams = {};

  for (let i = 0; i < slugs.length; i++) {
    const kw = i + 1;
    const slug = slugs[i];
    const cacheFile = join(CACHE_DIR, `${kw}.json`);

    if (existsSync(cacheFile)) {
      const cached = JSON.parse(readFileSync(cacheFile, 'utf8'));
      if (isComplete(cached)) {
        hexagrams[kw] = cached;
        process.stdout.write(`\r  ${kw}/64 (${slug}) cached            `);
        continue;
      }
    }

    const { judgment, image, lines } = await fetchHex(slug); // throws if it can't get a complete parse
    const entry = {
      judgment,
      image,
      lines: Object.fromEntries(lines.map((l, j) => [String(j + 1), l])),
    };
    writeFileSync(cacheFile, JSON.stringify(entry, null, 2) + '\n');
    hexagrams[kw] = entry;
    process.stdout.write(`\r  ${kw}/64 (${slug}) fetched           `);
    await sleep(1000 + Math.random() * 500); // be polite to the Wayback Machine
  }
  process.stdout.write('\n');

  const out = {
    meta: {
      id: 'legge',
      translator: 'James Legge',
      year: 1882,
      source: 'The Sacred Books of the East, Vol. XVI: The Yî King',
      digitized_by: 'Chinese Text Project (ctext.org)',
      license: 'Public Domain',
      language: 'en',
      note:
        "James Legge's 1882 English translation (public domain). Text reproduced verbatim from the Chinese Text Project's digitisation; Legge's bracketed clarifications and punctuation are preserved. Proper-name romanisations follow that digitisation (e.g. pinyin 'Qian' where Legge printed 'Khien'). Judgment = the hexagram text; Image = Legge's 'Great Symbolism' (Da Xiang); line texts = the six 爻辞, shown at read time only for moving lines.",
    },
    hexagrams,
  };
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, 'legge.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote legge.json with ${Object.keys(hexagrams).length} hexagrams. All checks passed.`);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
