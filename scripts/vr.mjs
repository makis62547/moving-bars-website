import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

const REMOTE_BASE = 'https://www.moving-bars.de';
const LOCAL_BASE = 'http://localhost:4321';
const OUTPUT_ROOT = 'vr';
const DIFF_THRESHOLD = 0.005; // 0.5%

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'cocktail-catering', path: '/cocktail-catering' },
  { name: 'mobile-bar', path: '/mobile-bar' },
];

const MODES = {
  BASELINE: 'baseline',
  RUN: 'run',
  UPDATE: 'update',
};

function viewportLabel(viewport) {
  return `${viewport.width}x${viewport.height}`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function saveScreenshot(page, filepath, options = {}) {
  await ensureDir(path.dirname(filepath));
  await page.screenshot({
    path: filepath,
    fullPage: false,
    scale: 'css',
    ...options,
  });
}

async function waitForStability(page) {
  await page.waitForLoadState('networkidle');
  try {
    await page.evaluate(() => {
      if (document.fonts?.ready) {
        return document.fonts.ready;
      }
      return true;
    });
  } catch (error) {
    console.warn('Font readiness wait failed, continuing', error);
  }

  const disableAnimationsCss = `
    *, *::before, *::after {
      transition-property: none !important;
      transition-duration: 0s !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
    html {
      scroll-behavior: auto !important;
    }
  `;
  await page.addStyleTag({ content: disableAnimationsCss });
}

async function closeCookieBanner(page) {
  const consentLabels = [
    'einverstanden',
    'akzeptieren',
    'akzeptiere',
    'ablehnen',
    'zustimmen',
    'accept',
    'agree',
    'ok',
    'allow',
  ];

  for (const label of consentLabels) {
    const locator = page.getByRole('button', { name: new RegExp(label, 'i') });
    if (await locator.count()) {
      try {
        await locator.first().click({ timeout: 2000 });
        return true;
      } catch (error) {
        console.warn(`Failed to click consent button "${label}":`, error);
      }
    }
  }
  return false;
}

async function capturePageScreenshot(browser, viewport, url, outputPath, fullPagePath) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    screen: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await waitForStability(page);
  await closeCookieBanner(page);
  await saveScreenshot(page, outputPath);
  if (fullPagePath) {
    await saveScreenshot(page, fullPagePath, { fullPage: true });
  }
  await context.close();
}

async function compareScreenshots(baselinePath, currentPath, diffPath) {
  const [baselineBuffer, currentBuffer] = await Promise.all([
    fs.readFile(baselinePath),
    fs.readFile(currentPath),
  ]);
  const baseline = PNG.sync.read(baselineBuffer);
  const current = PNG.sync.read(currentBuffer);

  if (baseline.width !== current.width || baseline.height !== current.height) {
    throw new Error(
      `Dimension mismatch for comparison: baseline ${baseline.width}x${baseline.height}, current ${current.width}x${current.height}`,
    );
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const mismatchedPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0.1 },
  );

  await ensureDir(path.dirname(diffPath));
  await fs.writeFile(diffPath, PNG.sync.write(diff));

  const totalPixels = baseline.width * baseline.height;
  const ratio = mismatchedPixels / totalPixels;
  return { mismatchedPixels, ratio };
}

function getOutputPaths(viewport, pageName) {
  const label = viewportLabel(viewport);
  const baseline = path.join(OUTPUT_ROOT, 'baseline', label, `${pageName}.png`);
  const current = path.join(OUTPUT_ROOT, 'current', label, `${pageName}.png`);
  const diff = path.join(OUTPUT_ROOT, 'diff', label, `${pageName}.png`);
  const baselineFullPage = path.join(OUTPUT_ROOT, 'baseline-fullpage', label, `${pageName}.png`);
  const currentFullPage = path.join(OUTPUT_ROOT, 'current-fullpage', label, `${pageName}.png`);
  return { baseline, current, diff, baselineFullPage, currentFullPage };
}

async function createBaseline(browser, baseUrl) {
  for (const viewport of VIEWPORTS) {
    for (const page of PAGES) {
      const targetUrl = new URL(page.path, baseUrl).toString();
      const { baseline, baselineFullPage } = getOutputPaths(viewport, page.name);
      console.log(`Creating baseline for ${targetUrl} at ${viewportLabel(viewport)}`);
      await capturePageScreenshot(browser, viewport, targetUrl, baseline, baselineFullPage);
    }
  }
}

async function createCurrent(browser, baseUrl) {
  for (const viewport of VIEWPORTS) {
    for (const page of PAGES) {
      const targetUrl = new URL(page.path, baseUrl).toString();
      const { current, currentFullPage } = getOutputPaths(viewport, page.name);
      console.log(`Capturing current for ${targetUrl} at ${viewportLabel(viewport)}`);
      await capturePageScreenshot(browser, viewport, targetUrl, current, currentFullPage);
    }
  }
}

async function runDiff() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of VIEWPORTS) {
    for (const page of PAGES) {
      const paths = getOutputPaths(viewport, page.name);
      if (!(await fileExists(paths.baseline))) {
        throw new Error(`Missing baseline screenshot: ${paths.baseline}`);
      }
      if (!(await fileExists(paths.current))) {
        throw new Error(`Missing current screenshot: ${paths.current}`);
      }

      console.log(`Diffing ${page.name} at ${viewportLabel(viewport)}`);
      const result = await compareScreenshots(paths.baseline, paths.current, paths.diff);
      results.push({ page: page.name, viewport: viewportLabel(viewport), ...result });
    }
  }

  await browser.close();
  const failures = results.filter((entry) => entry.ratio > DIFF_THRESHOLD);
  results.forEach((entry) => {
    const status = entry.ratio > DIFF_THRESHOLD ? 'FAIL' : 'PASS';
    console.log(
      `${status} ${entry.page} @ ${entry.viewport}: ${(entry.ratio * 100).toFixed(3)}% (${entry.mismatchedPixels}px)`,
    );
  });

  if (failures.length) {
    console.error(`Visual differences exceeded threshold (${DIFF_THRESHOLD * 100}% )`);
    process.exit(1);
  }
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const mode = process.argv[2] ?? MODES.RUN;
  const browser = await chromium.launch({ headless: true });

  if (mode === MODES.BASELINE) {
    await createBaseline(browser, REMOTE_BASE);
    await browser.close();
    return;
  }

  if (mode === MODES.UPDATE) {
    await createBaseline(browser, LOCAL_BASE);
    await browser.close();
    return;
  }

  if (mode !== MODES.RUN) {
    console.error(`Unknown mode: ${mode}`);
    await browser.close();
    process.exit(1);
  }

  await createCurrent(browser, LOCAL_BASE);
  await browser.close();
  await runDiff();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
