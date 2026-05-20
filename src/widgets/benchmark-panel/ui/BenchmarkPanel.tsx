import type { BoardMode } from '../../../shared/config/boardMode';

type BenchmarkPanelProps = {
  mode: BoardMode;
  itemCount: number;
  status: string;
  isRunning: boolean;
  showRenderHeat: boolean;
  onToggleRenderHeat: () => void;
  onRunBenchmark: () => void;
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
        <p className="benchmarkStatus">{status}</p>
      </div>
    </aside>
  );
}
