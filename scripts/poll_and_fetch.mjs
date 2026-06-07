// poll_and_fetch.mjs — wait out the ctext rate-limit ban, then scrape.
// Polls one page every 90s; the moment it returns 200, runs fetch_legge.mjs
// (which caches per hexagram and writes legge.json). Self-completing.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_MIN = 60;
const deadline = Date.now() + MAX_MIN * 60_000;

async function up() {
  try {
    const r = await fetch('https://ctext.org/book-of-changes/qian', {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
    });
    return r.status === 200;
  } catch {
    return false;
  }
}

while (Date.now() < deadline) {
  if (await up()) {
    console.log('ctext reachable — running fetch_legge.mjs');
    const res = spawnSync('node', [join(__dirname, 'fetch_legge.mjs')], { stdio: 'inherit' });
    process.exit(res.status ?? 0);
  }
  console.log(`${new Date().toLocaleTimeString()} still blocked; waiting 90s...`);
  await sleep(90_000);
}
console.error(`Gave up after ${MAX_MIN} min — ctext still blocked.`);
process.exit(1);
