import { expect, test } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

type Mode = 'Baseline' | 'Optimized';

type BenchmarkRow = {
  mode: string;
  itemCount: number;
  run: string;
  avgFps: string;
  minFps: string;
  avgFrameMs: string;
  maxFrameMs: string;
  appRenders: string;
  cardRenders: string;
  pointerUpdates: string;
  hardware: string;
  notes: string;
};

const OUTPUT_FILE = resolve('../diploma-react-performance/measurements/chapter-2-results.csv');
const HEADER = [
  'mode',
  'item_count',
  'run',
  'avg_fps',
  'min_fps',
  'avg_frame_ms',
  'max_frame_ms',
  'app_renders',
  'card_renders',
  'pointer_updates',
  'hardware',
  'notes',
].join(',');

const SCENARIOS: Array<{ mode: Mode; preset: 'Light' | 'Standard' | 'Stress'; itemCount: number }> = [
  { mode: 'Baseline', preset: 'Standard', itemCount: 180 },
  { mode: 'Optimized', preset: 'Standard', itemCount: 180 },
  { mode: 'Baseline', preset: 'Stress', itemCount: 420 },
  { mode: 'Optimized', preset: 'Stress', itemCount: 420 },
];

test.describe.serial('performance board benchmark', () => {
  for (const scenario of SCENARIOS) {
    test(`${scenario.mode} ${scenario.itemCount}`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: scenario.mode }).click();
      await page.getByRole('button', { name: new RegExp(`^${scenario.preset}\\s+${scenario.itemCount}$`) }).click();
      await expect(page.getByRole('button', { name: scenario.preset })).toHaveAttribute('aria-pressed', 'true');

      await page.getByRole('button', { name: 'Start 10s run' }).click();

      const firstCard = page.locator('.boardCard').first();
      await expect(firstCard).toBeVisible();
      const cardBox = await firstCard.boundingBox();
      const viewportBox = await page.locator('.boardViewport').boundingBox();

      if (!cardBox || !viewportBox) {
        throw new Error('Unable to locate board card or viewport for benchmark drag.');
      }

      const startX = cardBox.x + cardBox.width / 2;
      const startY = cardBox.y + cardBox.height / 2;
      const endX = Math.min(viewportBox.x + viewportBox.width - 80, startX + 620);
      const endY = Math.min(viewportBox.y + viewportBox.height - 80, startY + 340);

      await page.mouse.move(startX, startY);
      await page.mouse.down();

      for (let step = 1; step <= 120; step += 1) {
        const progress = step / 120;
        await page.mouse.move(startX + (endX - startX) * progress, startY + (endY - startY) * progress);
        await page.waitForTimeout(80);
      }

      await page.mouse.up();
      await expect(page.getByText('Run complete')).toBeVisible({ timeout: 15_000 });

      const result = await readBenchmarkResult(page);
      await appendBenchmarkRow({
        mode: scenario.mode.toLowerCase(),
        itemCount: scenario.itemCount,
        run: 'playwright-1',
        avgFps: result.FPS,
        minFps: '',
        avgFrameMs: stripMs(result['Avg frame']),
        maxFrameMs: stripMs(result['Max frame']),
        appRenders: result['App renders'],
        cardRenders: result['Card renders'],
        pointerUpdates: result['Pointer updates'],
        hardware: 'MacBook M5',
        notes: 'automated playwright drag',
      });
    });
  }
});

async function readBenchmarkResult(page: import('@playwright/test').Page) {
  const rows = page.locator('.benchmarkResult div');
  const count = await rows.count();
  const result: Record<string, string> = {};

  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    const label = (await row.locator('dt').innerText()).trim();
    const value = (await row.locator('dd').innerText()).trim();
    result[label] = value;
  }

  return result;
}

async function appendBenchmarkRow(row: BenchmarkRow) {
  await mkdir(dirname(OUTPUT_FILE), { recursive: true });

  let existing = '';

  try {
    existing = await readFile(OUTPUT_FILE, 'utf8');
  } catch {
    existing = '';
  }

  const line = [
    row.mode,
    row.itemCount,
    row.run,
    row.avgFps,
    row.minFps,
    row.avgFrameMs,
    row.maxFrameMs,
    row.appRenders,
    row.cardRenders,
    row.pointerUpdates,
    row.hardware,
    row.notes,
  ].join(',');

  const next = existing.trim().length > 0 ? `${existing.trim()}\n${line}\n` : `${HEADER}\n${line}\n`;
  await writeFile(OUTPUT_FILE, next);
}

function stripMs(value: string) {
  return value.replace(/\s*ms$/, '');
}

