import { CSSProperties, PointerEvent, useRef } from 'react';
import { incrementCardRenderCount } from '../../../shared/lib/performance';
import { BoardItem, BoardStats } from '../model/types';

type BoardCardProps = {
  item: BoardItem;
  stats: BoardStats;
  allItems: BoardItem[];
  onStartDrag: (event: PointerEvent<HTMLElement>, item: BoardItem) => void;
  showRenderHeat: boolean;
};

export function BoardCard({ item, stats, allItems, onStartDrag, showRenderHeat }: BoardCardProps) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  incrementCardRenderCount('baseline');

  const isSelected = stats.selectedId === item.id;
  const isDragging = stats.draggingId === item.id;
  const neighborCount = allItems.filter((candidate) => Math.abs(candidate.x - item.x) < 230).length;
  const heatClassName = showRenderHeat ? 'renderHeat' : '';
  const heatHue = 188 + ((renderCount.current + item.id) % 5) * 18;

  return (
    <article
      className={`boardCard ${heatClassName} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        '--render-heat-hue': heatHue,
        width: item.width,
        transform: `translate(${item.x}px, ${item.y}px)`,
        backgroundColor: item.color,
      } as CSSProperties}
      onPointerDown={(event) => onStartDrag(event, item)}
    >
      {showRenderHeat && <span key={renderCount.current} className="renderPulse" />}
      <div className="cardTopline">
        <span>{item.kind}</span>
        <span>#{item.id}</span>
      </div>
      <h2>{item.title}</h2>
      <p>{item.body}</p>
      <footer>
        {showRenderHeat && <span>Рендеров: {renderCount.current}</span>}
        <span>Соседей: {neighborCount}</span>
      </footer>
    </article>
  );
}
