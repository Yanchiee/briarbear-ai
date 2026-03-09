import puppeteer from 'puppeteer';
import { mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const dir = join(__dirname, 'temporary screenshots');
mkdirSync(dir, { recursive: true });

const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const nextNum = existing.length > 0
  ? Math.max(...existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0'))) + 1
  : 1;

const filename = label
  ? `screenshot-${nextNum}-${label}.png`
  : `screenshot-${nextNum}.png`;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait for loader to disappear
await new Promise(r => setTimeout(r, 2000));

await page.screenshot({
  path: join(dir, filename),
  fullPage: true,
});

console.log(`Screenshot saved: temporary screenshots/${filename}`);
await browser.close();
