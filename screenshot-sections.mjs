import puppeteer from 'puppeteer';
import { mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, 'temporary screenshots');
mkdirSync(dir, { recursive: true });

const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-'));
let nextNum = existing.length > 0
  ? Math.max(...existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0'))) + 1
  : 1;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

// Scroll through entire page to trigger reveals
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let totalHeight = 0;
    const timer = setInterval(() => {
      window.scrollBy(0, 300);
      totalHeight += 300;
      if (totalHeight >= document.body.scrollHeight) { clearInterval(timer); resolve(); }
    }, 80);
  });
});
await new Promise(r => setTimeout(r, 1500));

// Screenshot at different scroll positions
const sections = [
  { name: 'about-stats', selector: '#about' },
  { name: 'values', selector: '#values' },
  { name: 'cta-footer', selector: '#contact' },
];

for (const s of sections) {
  await page.evaluate((sel) => {
    document.querySelector(sel)?.scrollIntoView({ block: 'start' });
  }, s.selector);
  await new Promise(r => setTimeout(r, 600));
  const filename = `screenshot-${nextNum}-${s.name}.png`;
  await page.screenshot({ path: join(dir, filename) });
  console.log(`Saved: temporary screenshots/${filename}`);
  nextNum++;
}

await browser.close();
