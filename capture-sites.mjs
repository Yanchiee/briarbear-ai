import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotsDir = join(__dirname, 'screenshots');

const pages = [
  { url: 'https://yibby.ai', name: 'yibby-homepage' },
  { url: 'https://yibby.ai/gifts-for-her', name: 'yibby-gifts-for-her' },
  { url: 'https://yibby.ai/gifts-for-him', name: 'yibby-gifts-for-him' },
  { url: 'https://yibby.ai/search', name: 'yibby-search' },
  { url: 'https://arca.ph', name: 'arca-homepage' },
  { url: 'https://arca.ph/jobs', name: 'arca-jobs' },
  { url: 'https://arca.ph/pricing', name: 'arca-pricing' },
  { url: 'https://arca.ph/arca-scout', name: 'arca-scout' },
];

async function capture() {
  await mkdir(screenshotsDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const { url, name } of pages) {
    const filePath = join(screenshotsDir, `${name}.png`);
    console.log(`Capturing ${url} -> ${name}.png`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`  Saved ${name}.png`);
    } catch (err) {
      console.error(`  Failed to capture ${url}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Done.');
}

capture();
