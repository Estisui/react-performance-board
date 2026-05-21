import type { BoardMode } from '../../../shared/config/boardMode';

type BenchmarkPanelProps = {
  mode: BoardMode;
  itemCount: number;
  status: string;
  isRunning: boolean;
  result: BenchmarkResult | null;
  showRenderHeat: boolean;
  onToggleRenderHeat: () => void;
  onRunBenchmark: () => void;
};

export type BenchmarkResult = {
  fps: number;
  averageFrameMs: number;
  maxFrameMs: number;
  appRenders: number;
  cardRenders: number;
  pointerUpdates: number;
};

const MODE_LABELS: Record<BoardMode, string> = {
  baseline: 'Baseline',
  optimized: 'Optimized',
};

export function BenchmarkPanel({
  mode,
  itemCount,
  status,
  isRunning,
  result,
  showRenderHeat,
  onToggleRenderHeat,
  onRunBenchmark,
}: BenchmarkPanelProps) {
  return (
    <aside className="benchmarkPanel" aria-label="Experiment controls">
      <div>
        <h2>Experiment</h2>
        <p>
          {MODE_LABELS[mode]} · {itemCount} elements
        </p>
      </div>

      <div className="benchmarkActions">
        <button type="button" className="benchmarkButton" onClick={onRunBenchmark} disabled={isRunning}>
          {isRunning ? 'Recording...' : 'Start 10s run'}
        </button>
        <label className="toggleControl">
          <input type="checkbox" checked={showRenderHeat} onChange={onToggleRenderHeat} />
          <span>Show render heat</span>
        </label>
        {result && (
          <dl className="benchmarkResult">
            <div>
              <dt>FPS</dt>
              <dd>{result.fps}</dd>
            </div>
            <div>
              <dt>Avg frame</dt>
              <dd>{result.averageFrameMs} ms</dd>
            </div>
            <div>
              <dt>Max frame</dt>
              <dd>{result.maxFrameMs} ms</dd>
            </div>
            <div>
              <dt>App renders</dt>
              <dd>{result.appRenders}</dd>
            </div>
            <div>
              <dt>Card renders</dt>
              <dd>{result.cardRenders}</dd>
            </div>
            <div>
              <dt>Pointer updates</dt>
              <dd>{result.pointerUpdates}</dd>
            </div>
          </dl>
        )}
        <p className="benchmarkStatus">{status}</p>
      </div>
    </aside>
  );
}
