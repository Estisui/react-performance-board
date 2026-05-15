import { PointerEvent, useEffect, useRef, useState } from 'react';
import { Board, createBoardItem, createItems, DEFAULT_ITEM_COUNT, BOARD_HEIGHT, BOARD_WIDTH } from '../../../entities/board';
import { BoardItem, BoardStats, DragState } from '../../../entities/board/model/types';
import { MetricsPanel } from '../../../widgets/metrics-panel';
import { Toolbar } from '../../../widgets/toolbar';

let appRenderCounter = 0;

export function SlowBoardPage() {
  appRenderCounter += 1;

  const [items, setItems] = useState<BoardItem[]>(() => createItems(DEFAULT_ITEM_COUNT));
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pointerUpdates, setPointerUpdates] = useState(0);
  const [fps, setFps] = useState(60);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const frameTimes = useRef<number[]>([]);

  useEffect(() => {
    let frameHandle = 0;
    let lastTime = performance.now();

    const measureFrame = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      frameTimes.current = [...frameTimes.current.slice(-30), delta];
      const average = frameTimes.current.reduce((sum, value) => sum + value, 0) / frameTimes.current.length;
      setFps(Math.round(1000 / average));
      frameHandle = requestAnimationFrame(measureFrame);
    };

    frameHandle = requestAnimationFrame(measureFrame);

    return () => cancelAnimationFrame(frameHandle);
  }, []);

  const stats: BoardStats = {
    renderCount: appRenderCounter,
    pointerUpdates,
    fps,
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

  const handleAddItem = () => {
    setItems([...items, createBoardItem(items.length)]);
  };

  const handleRemoveSelected = () => {
    if (selectedId === null) {
      return;
    }

    setItems(items.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  const handleGenerate = (count: number) => {
    setItems(createItems(count, true));
    setSelectedId(null);
    setDragState(null);
    setPointerUpdates(0);
  };

  return (
    <main className="appShell">
      <Toolbar
        itemCount={items.length}
        onAddItem={handleAddItem}
        onRemoveSelected={handleRemoveSelected}
        onGenerate={handleGenerate}
        selectedId={selectedId}
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
        <MetricsPanel stats={stats} itemCount={items.length} />
      </section>
    </main>
  );
}
