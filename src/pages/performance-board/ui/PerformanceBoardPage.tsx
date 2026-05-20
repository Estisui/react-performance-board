import { PointerEvent, useRef, useState } from 'react';
import { Board, createItems, DEFAULT_ITEM_COUNT, BOARD_HEIGHT, BOARD_WIDTH } from '../../../entities/board';
import { BoardItem, BoardStats, DragState } from '../../../entities/board/model/types';
import type { BoardMode } from '../../../shared/config/boardMode';
import { useFrameMetrics } from '../../../shared/lib/performance';
import { MetricsPanel } from '../../../widgets/metrics-panel';
import { Toolbar } from '../../../widgets/toolbar';

let appRenderCounter = 0;

type PerformanceBoardPageProps = {
  mode: BoardMode;
  onModeChange: (mode: BoardMode) => void;
};

export function PerformanceBoardPage({ mode, onModeChange }: PerformanceBoardPageProps) {
  appRenderCounter += 1;

  const [items, setItems] = useState<BoardItem[]>(() => createItems(DEFAULT_ITEM_COUNT));
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pointerUpdates, setPointerUpdates] = useState(0);
  const frameMetrics = useFrameMetrics();
  const boardRef = useRef<HTMLDivElement | null>(null);

  const stats: BoardStats = {
    renderCount: appRenderCounter,
    pointerUpdates,
    fps: frameMetrics.fps,
    averageFrameMs: frameMetrics.averageFrameMs,
    maxFrameMs: frameMetrics.maxFrameMs,
    droppedFrames: frameMetrics.droppedFrames,
    selectedId,
    draggingId: dragState?.itemId ?? null,
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState || !boardRef.current) {
      return;
    }

    const boardRect = boardRef.current.getBoundingClientRect();
    const nextX = event.clientX - boardRect.left + boardRef.current.scrollLeft - dragState.offsetX;
    const nextY = event.clientY - boardRect.top + boardRef.current.scrollTop - dragState.offsetY;

    setPointerUpdates(pointerUpdates + 1);
    setItems(
      items.map((item) => {
        if (item.id !== dragState.itemId) {
          return {
            ...item,
            title: item.title,
          };
        }

        return {
          ...item,
          x: Math.max(0, Math.min(BOARD_WIDTH - item.width, nextX)),
          y: Math.max(0, Math.min(BOARD_HEIGHT - item.height, nextY)),
        };
      }),
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState) {
      event.currentTarget.releasePointerCapture(dragState.pointerId);
    }

    setDragState(null);
  };

  const handleStartDrag = (event: PointerEvent<HTMLElement>, item: BoardItem) => {
    const itemRect = event.currentTarget.getBoundingClientRect();

    setSelectedId(item.id);
    setDragState({
      itemId: item.id,
      pointerId: event.pointerId,
      offsetX: event.clientX - itemRect.left,
      offsetY: event.clientY - itemRect.top,
    });
    boardRef.current?.setPointerCapture(event.pointerId);
  };

  const handleGenerate = (count: number) => {
    setItems(createItems(count, true));
    setSelectedId(null);
    setDragState(null);
    setPointerUpdates(0);
  };

  return (
    <main className="appShell" data-mode={mode}>
      <Toolbar
        mode={mode}
        itemCount={items.length}
        onModeChange={onModeChange}
        onGenerate={handleGenerate}
      />
      <section className="workspace">
        <Board
          items={items}
          stats={stats}
          boardRef={boardRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onStartDrag={handleStartDrag}
        />
        <MetricsPanel stats={stats} />
      </section>
    </main>
  );
}
