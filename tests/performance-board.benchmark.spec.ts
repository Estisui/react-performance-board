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

const OUTPUT_FILE = resolve('../diploma-react-performance/chapter-2/measurements/chapter-2-results.csv');
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
      await page.goto('/?visualMode=measurement');
      await page.getByRole('button', { name: scenario.mode }).click();
      await page.getByRole('button', { name: new RegExp(`^${scenario.preset}\\s+${scenario.itemCount}$`) }).click();
      await expect(page.getByRole('button', { name: scenario.preset })).toHaveAttribute('aria-pressed', 'true');

      await page.getByRole('button', { name: 'Start 10s run' }).click();

      const targetCard = page.locator('.boardCard').first();
      await expect(targetCard).toBeVisible();
      const viewportBox = await page.locator('.boardViewport').boundingBox();

      if (!viewportBox) {
        throw new Error('Unable to locate board card or viewport for benchmark drag.');
      }

      const cardBox = await targetCard.boundingBox();

      if (!cardBox) {
        throw new Error('Unable to locate board card for benchmark drag.');
      }

      const startX = cardBox.x + cardBox.width / 2;
      const startY = cardBox.y + cardBox.height / 2;
      const leftTarget = {
        x: Math.max(viewportBox.x + 120, startX - 80),
        y: Math.max(viewportBox.y + 120, startY - 60),
      };
      const rightTarget = {
        x: Math.min(viewportBox.x + viewportBox.width - 110, startX + 1040),
        y: Math.min(viewportBox.y + viewportBox.height - 110, startY + 600),
      };

      await page.mouse.move(startX, startY);
      await page.mouse.down();

      let currentX = startX;
      let currentY = startY;

      let runComplete = false;

      for (let sweep = 0; sweep < 26 && !runComplete; sweep += 1) {
        const target = sweep % 2 === 0 ? rightTarget : leftTarget;

        for (let step = 1; step <= 28 && !runComplete; step += 1) {
          const progress = step / 28;
          await page.mouse.move(
            currentX + (target.x - currentX) * progress,
            currentY + (target.y - currentY) * progress,
          );
          await page.waitForTimeout(12);
          runComplete = await page.getByText('Run complete').isVisible();
        }

        currentX = target.x;
        currentY = target.y;
      }

      await page.mouse.up();
      await expect(page.getByText('Run complete')).toBeVisible({ timeout: 15_000 });

      const result = await readBenchmarkResult(page);
      await appendBenchmarkRow({
        mode: scenario.mode.toLowerCase(),
        itemCount: scenario.itemCount,
        run: 'playwright-production-1',
        avgFps: result.FPS,
        minFps: '',
        avgFrameMs: stripMs(result['Avg frame']),
        maxFrameMs: stripMs(result['Max frame']),
        appRenders: result['App renders'],
        cardRenders: result['Card renders'],
        pointerUpdates: result['Pointer updates'],
        hardware: 'MacBook M5',
        notes: 'production build benchmark with simplified measurement visuals',
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
