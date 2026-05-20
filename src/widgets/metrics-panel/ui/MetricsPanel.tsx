import { BoardStats } from '../../../entities/board';
import type { BoardMode } from '../../../shared/config/boardMode';

type MetricsPanelProps = {
  mode: BoardMode;
  stats: BoardStats;
};

const MODE_NOTES: Record<BoardMode, string> = {
  baseline: 'Базовая версия хранит все элементы в одном состоянии и обновляет его при каждом движении указателя.',
  optimized: 'Оптимизированная версия сохраняет ссылки неизмененных элементов и рендерит только видимую часть доски.',
};

export function MetricsPanel({ mode, stats }: MetricsPanelProps) {
  return (
    <aside className="metricsPanel" aria-label="Performance metrics">
      <h2>Metrics / Метрики</h2>
      <dl>
        <div>
          <dt>FPS</dt>
          <dd>{Number.isFinite(stats.fps) ? stats.fps : 0}</dd>
        </div>
        <div>
          <dt>App renders</dt>
          <dd>{stats.renderCount}</dd>
        </div>
        <div>
          <dt>Pointer updates</dt>
          <dd>{stats.pointerUpdates}</dd>
        </div>
        <div>
          <dt>Avg frame</dt>
          <dd>{stats.averageFrameMs} ms</dd>
        </div>
        <div>
          <dt>Max frame</dt>
          <dd>{stats.maxFrameMs} ms</dd>
        </div>
        <div>
          <dt>Dropped frames</dt>
          <dd>{stats.droppedFrames}</dd>
        </div>
        <div>
          <dt>Selected</dt>
          <dd>{stats.selectedId ?? 'none'}</dd>
        </div>
        <div>
          <dt>Dragging</dt>
          <dd>{stats.draggingId ?? 'none'}</dd>
        </div>
        {typeof stats.visibleItems === 'number' && (
          <div>
            <dt>Visible</dt>
            <dd>{stats.visibleItems}</dd>
          </div>
        )}
      </dl>
      <p>{MODE_NOTES[mode]}</p>
    </aside>
  );
}
