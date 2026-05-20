import { BoardStats } from '../../../entities/board';

type MetricsPanelProps = {
  stats: BoardStats;
};

export function MetricsPanel({ stats }: MetricsPanelProps) {
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
      </dl>
      <p>Базовая версия специально хранит все элементы в одном состоянии и обновляет его при каждом движении указателя.</p>
    </aside>
  );
}
