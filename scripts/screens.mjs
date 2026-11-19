// Renders the app at the PR base and head with GitHub mocked, and writes before/after screenshots
// plus a manifest for Triforce's design review (artifact "triforce-screens").
// Usage: node scripts/screens.mjs <base-dir> <head-dir> <out-dir> <head-sha>
// Each dir is a checkout that has already been through `npm run build`. Each is served with
// `next start`, with GRAVEYARD_GITHUB_API_URL pointing at scripts/mock-github.mjs.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { startMockGithub } from './mock-github.mjs';

/** Screens to capture. Each opens the app and gets to the screen the way a person would. */
const SCREENS = [
  { id: 'landing', title: 'Landing page', path: '/', go: async () => {} },
  { id: 'graveyard', title: 'Graveyard (mocked user)', path: '/ghost-coder', go: async () => {} },
];

const [baseDir, headDir, outArg = 'screens-out', headSha = ''] = process.argv.slice(2);
const out = resolve(outArg);

/** Starts `next start` in `dir` and resolves once it answers. */
async function serve(dir, port, githubUrl) {
  const child = spawn('npx', ['next', 'start', '-p', String(port)], {
    cwd: dir,
    // GITHUB_API_URL too, for a base built before the rename.
    env: { ...process.env, GRAVEYARD_GITHUB_API_URL: githubUrl, GITHUB_API_URL: githubUrl, GITHUB_TOKENS: '', GITHUB_TOKEN: '' },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).status) return { url, close: () => child.kill() };
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  child.kill();
  throw new Error(`next start in ${dir} did not come up`);
}

async function capture(browser, dir, side, port, githubUrl) {
  const shots = {};
  // A base from before the GITHUB_API_URL hook exists would talk to the real GitHub: skip it,
  // so every screen shows as new rather than as a flaky diff against live data.
  const usable = dir && existsSync(join(dir, '.next')) && readFileSync(join(dir, 'lib/github.ts'), 'utf8').includes('GITHUB_API_URL');
  if (!usable) {
    console.warn(`${side}: no build with the GITHUB_API_URL hook at ${dir}; skipping`);
    return shots;
  }
  const { url, close } = await serve(dir, port, githubUrl);
  mkdirSync(join(out, side), { recursive: true });
  for (const s of SCREENS) {
    const page = await browser.newPage({ viewport: { width: 480, height: 720 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.warn(`${side} ${s.id}: page error: ${e.message}`));
    try {
      await page.goto(url + s.path, { waitUntil: 'networkidle' });
      await s.go(page);
      await page.waitForTimeout(500);
      const path = `${side}/${s.id}.png`;
      await page.screenshot({ path: join(out, path), fullPage: true, animations: 'disabled' });
      shots[s.id] = path;
    } catch (e) {
      console.warn(`${side} ${s.id}: ${e.message}`);
    } finally {
      await page.close();
    }
  }
  close();
  return shots;
}

// The workflow starts the mock before building (the landing page prerenders GitHub data at build
// time) and passes it in as GRAVEYARD_GITHUB_API_URL; run standalone, start our own.
const mock = process.env.GRAVEYARD_GITHUB_API_URL
  ? { url: process.env.GRAVEYARD_GITHUB_API_URL, close: () => {} }
  : await startMockGithub();
const browser = await chromium.launch({ channel: 'chrome' });
let before = {};
let after = {};
try {
  before = await capture(browser, baseDir, 'before', 3101, mock.url);
  after = await capture(browser, headDir, 'after', 3102, mock.url);
} finally {
  await browser.close();
  mock.close();
}
const same = (id) => before[id] && after[id] && readFileSync(join(out, before[id])).equals(readFileSync(join(out, after[id])));
const screens = SCREENS.filter((s) => before[s.id] || after[s.id]).map((s) => ({
  id: s.id, title: s.title, platform: 'web', before: before[s.id], after: after[s.id], changed: !same(s.id),
}));
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'manifest.json'), JSON.stringify({ version: 1, head_sha: headSha, screens }, null, 2));
console.log(screens.map((s) => `${s.id}: ${s.changed ? 'changed' : 'same'}`).join('\n'));
