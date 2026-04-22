#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const label = process.argv[2] || 'baseline';
const BASE_URL = process.env.CAPTURE_URL || 'http://127.0.0.1:4173/';
const OUT_DIR = join(ROOT, 'screenshots', label);

const VIEWPORTS = [
  { name: 'mobile-s', width: 375, height: 812 },
  { name: 'mobile-l', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'wide', width: 1440, height: 900 },
];

const SECTIONS = [
  { name: 'hero', selector: '.eli5-hero, .eli5-first-fold' },
  { name: 'how', selector: '.eli5-how' },
  { name: 'examples', selector: '.eli5-example-threads, .eli5-playfield' },
  { name: 'install', selector: '.eli5-section--install' },
  { name: 'download', selector: '.eli5-section--download' },
  { name: 'footer', selector: '.eli5-site-footer' },
];

async function ensureDir(path) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

async function captureSection(page, section, destPath) {
  const selectors = section.selector.split(',').map((s) => s.trim());
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.count() === 0) continue;
    try {
      await locator.scrollIntoViewIfNeeded({ timeout: 2000 });
      await page.waitForTimeout(400);
      await locator.screenshot({ path: destPath, timeout: 5000 });
      return true;
    } catch (err) {
      console.warn(`  [warn] section ${section.name} via '${selector}': ${err.message}`);
    }
  }
  return false;
}

async function main() {
  console.log(`Capturing label='${label}' from ${BASE_URL}`);
  await ensureDir(OUT_DIR);

  const browser = await chromium.launch();
  try {
    for (const vp of VIEWPORTS) {
      console.log(`-> viewport ${vp.name} (${vp.width}x${vp.height})`);
      const vpDir = join(OUT_DIR, vp.name);
      await ensureDir(vpDir);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();

      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1200);

      await page.screenshot({
        path: join(vpDir, 'fullpage.png'),
        fullPage: true,
      });

      for (const section of SECTIONS) {
        const ok = await captureSection(
          page,
          section,
          join(vpDir, `${section.name}.png`),
        );
        if (!ok) console.warn(`  missing: ${section.name} @ ${vp.name}`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`Done. Screenshots in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
