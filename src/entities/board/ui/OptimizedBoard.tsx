import { memo, PointerEvent, RefObject } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../model/boardFactory';
import { BoardItem } from '../model/types';
import { OptimizedBoardCard } from './OptimizedBoardCard';

type OptimizedBoardProps = {
  items: BoardItem[];
  selectedId: number | null;
  draggingId: number | null;
  neighborCounts: Map<number, number>;
  boardRef: RefObject<HTMLDivElement | null>;
  showRenderHeat: boolean;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onScroll: () => void;
  onStartDrag: (event: PointerEvent<HTMLElement>, item: BoardItem) => void;
};

export const OptimizedBoard = memo(function OptimizedBoard({
  items,
  selectedId,
  draggingId,
  neighborCounts,
  boardRef,
  showRenderHeat,
  onPointerMove,
  onPointerUp,
  onScroll,
  onStartDrag,
}: OptimizedBoardProps) {
  return (
    <div
      className="boardViewport"
      ref={boardRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onScroll={onScroll}
    >
      <div className="boardCanvas" style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}>
        <div className="gridOverlay" />
        {items.map((item) => (
          <OptimizedBoardCard
            key={item.id}
            item={item}
            neighborCount={neighborCounts.get(item.id) ?? 0}
            isSelected={selectedId === item.id}
            isDragging={draggingId === item.id}
            showRenderHeat={showRenderHeat}
            onStartDrag={onStartDrag}
          />
        ))}
      </div>
    </div>
  );
});

