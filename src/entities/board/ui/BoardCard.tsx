import { PointerEvent } from 'react';
import { addSyntheticRenderCost } from '../model/renderCost';
import { BoardItem, BoardStats } from '../model/types';

type BoardCardProps = {
  item: BoardItem;
  stats: BoardStats;
  allItems: BoardItem[];
  onStartDrag: (event: PointerEvent<HTMLElement>, item: BoardItem) => void;
};

export function BoardCard({ item, stats, allItems, onStartDrag }: BoardCardProps) {
  addSyntheticRenderCost(item, stats);
  const isSelected = stats.selectedId === item.id;
  const isDragging = stats.draggingId === item.id;
  const neighborCount = allItems.filter((candidate) => Math.abs(candidate.x - item.x) < 230).length;

  return (
    <article
      className={`boardCard ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        width: item.width,
        transform: `translate(${item.x}px, ${item.y}px)`,
        backgroundColor: item.color,
      }}
      onPointerDown={(event) => onStartDrag(event, item)}
    >
      <div className="cardTopline">
        <span>{item.kind}</span>
        <span>#{item.id}</span>
      </div>
      <h2>{item.title}</h2>
      <p>{item.body}</p>
      <footer>
        <span>Соседей: {neighborCount}</span>
      </footer>
    </article>
  );
}
