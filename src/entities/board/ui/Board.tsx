import { PointerEvent, RefObject } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../model/boardFactory';
import { BoardItem, BoardStats } from '../model/types';
import { BoardCard } from './BoardCard';

type BoardProps = {
  items: BoardItem[];
  stats: BoardStats;
  boardRef: RefObject<HTMLDivElement | null>;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onStartDrag: (event: PointerEvent<HTMLElement>, item: BoardItem) => void;
};

export function Board({ items, stats, boardRef, onPointerMove, onPointerUp, onStartDrag }: BoardProps) {
  return (
    <div
      className="boardViewport"
      ref={boardRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="boardCanvas" style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}>
        <div className="gridOverlay" />
        {items.map((item) => (
          <BoardCard key={item.id} item={item} stats={stats} allItems={items} onStartDrag={onStartDrag} />
        ))}
      </div>
    </div>
  );
}
