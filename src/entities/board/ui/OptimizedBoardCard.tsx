import { CSSProperties, memo, PointerEvent, useRef } from 'react';
import { incrementCardRenderCount } from '../../../shared/lib/performance';
import { BoardItem } from '../model/types';

type OptimizedBoardCardProps = {
  item: BoardItem;
  neighborCount: number;
  isSelected: boolean;
  isDragging: boolean;
  showRenderHeat: boolean;
  onStartDrag: (event: PointerEvent<HTMLElement>, item: BoardItem) => void;
};

export const OptimizedBoardCard = memo(function OptimizedBoardCard({
  item,
  neighborCount,
  isSelected,
  isDragging,
  showRenderHeat,
  onStartDrag,
}: OptimizedBoardCardProps) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  incrementCardRenderCount('optimized');

  const heatClassName = showRenderHeat ? 'renderHeat' : '';
  const heatHue = 150 + ((renderCount.current + item.id) % 5) * 16;

  return (
    <article
      className={`boardCard optimizedCard ${heatClassName} ${isSelected ? 'selected' : ''} ${
        isDragging ? 'dragging' : ''
      }`}
      style={
        {
          '--render-heat-hue': heatHue,
          width: item.width,
          transform: `translate(${item.x}px, ${item.y}px)`,
          backgroundColor: item.color,
        } as CSSProperties
      }
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
});
