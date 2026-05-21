import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH, createItems, OptimizedBoard } from '../../../entities/board';
import { BoardItem, BoardStats, DragState } from '../../../entities/board/model/types';
import { getBenchmarkDurationMs } from '../../../shared/config/benchmark';
import type { BoardMode } from '../../../shared/config/boardMode';
import { getCardRenderCount, resetCardRenderCount, useFrameMetrics } from '../../../shared/lib/performance';
import { BenchmarkPanel } from '../../../widgets/benchmark-panel';
import type { BenchmarkResult } from '../../../widgets/benchmark-panel/ui/BenchmarkPanel';
import { MetricsPanel } from '../../../widgets/metrics-panel';
import { Toolbar } from '../../../widgets/toolbar';

let optimizedRenderCounter = 0;
const VIEWPORT_BUFFER = 260;

type ViewportRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type OptimizedBoardModeProps = {
  mode: BoardMode;
  itemCount: number;
  showRenderHeat: boolean;
  onItemCountChange: (count: number) => void;
  onModeChange: (mode: BoardMode) => void;
  onToggleRenderHeat: () => void;
};

export function resetOptimizedRenderCounter() {
  optimizedRenderCounter = 0;
  resetCardRenderCount('optimized');
}

export function OptimizedBoardMode({
  mode,
  itemCount,
  showRenderHeat,
  onItemCountChange,
  onModeChange,
  onToggleRenderHeat,
}: OptimizedBoardModeProps) {
  optimizedRenderCounter += 1;
  const benchmarkDurationMs = getBenchmarkDurationMs();

  const [items, setItems] = useState<BoardItem[]>(() => createItems(itemCount, true));
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pointerUpdates, setPointerUpdates] = useState(0);
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState(false);
  const [benchmarkStatus, setBenchmarkStatus] = useState('Start a 10-second manual run, then drag one card.');
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [viewport, setViewport] = useState<ViewportRect>({
    left: 0,
    top: 0,
    right: 1280,
    bottom: 720,
  });

  const frameMetrics = useFrameMetrics();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const benchmarkTimeoutRef = useRef<number | null>(null);

  const updateViewport = useCallback(() => {
    const boardElement = boardRef.current;

    if (!boardElement) {
      return;
    }

    setViewport({
      left: boardElement.scrollLeft,
      top: boardElement.scrollTop,
      right: boardElement.scrollLeft + boardElement.clientWidth,
      bottom: boardElement.scrollTop + boardElement.clientHeight,
    });
  }, []);

  useEffect(() => {
    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);

      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
      }

      if (benchmarkTimeoutRef.current !== null) {
        window.clearTimeout(benchmarkTimeoutRef.current);
      }
    };
  }, [updateViewport]);

  const visibleItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.x + item.width >= viewport.left - VIEWPORT_BUFFER &&
          item.x <= viewport.right + VIEWPORT_BUFFER &&
          item.y + item.height >= viewport.top - VIEWPORT_BUFFER &&
          item.y <= viewport.bottom + VIEWPORT_BUFFER,
      ),
    [items, viewport],
  );

  const neighborCounts = useMemo(() => {
    const counts = new Map<number, number>();

    for (const item of visibleItems) {
      let count = 0;

      for (const candidate of items) {
        if (Math.abs(candidate.x - item.x) < 230) {
          count += 1;
        }
      }

      counts.set(item.id, count);
    }

    return counts;
  }, [items, visibleItems]);

  const stats: BoardStats = {
    renderCount: optimizedRenderCounter,
    cardRenders: getCardRenderCount('optimized'),
    pointerUpdates,
    fps: frameMetrics.fps,
    averageFrameMs: frameMetrics.averageFrameMs,
    maxFrameMs: frameMetrics.maxFrameMs,
    droppedFrames: frameMetrics.droppedFrames,
    visibleItems: visibleItems.length,
    selectedId,
    draggingId: dragState?.itemId ?? null,
  };
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const flushDragUpdate = useCallback(() => {
    dragFrameRef.current = null;
    const currentDragState = dragStateRef.current;
    const latestPointer = latestPointerRef.current;

    if (!currentDragState || !latestPointer) {
      return;
    }

    setPointerUpdates((value) => value + 1);
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== currentDragState.itemId) {
          return item;
        }

        return {
          ...item,
          x: Math.max(0, Math.min(BOARD_WIDTH - item.width, latestPointer.x)),
          y: Math.max(0, Math.min(BOARD_HEIGHT - item.height, latestPointer.y)),
        };
      }),
    );
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const currentDragState = dragStateRef.current;
      const boardElement = boardRef.current;

      if (!currentDragState || !boardElement) {
        return;
      }

      const boardRect = boardElement.getBoundingClientRect();
      latestPointerRef.current = {
        x: event.clientX - boardRect.left + boardElement.scrollLeft - currentDragState.offsetX,
        y: event.clientY - boardRect.top + boardElement.scrollTop - currentDragState.offsetY,
      };

      if (dragFrameRef.current === null) {
        dragFrameRef.current = requestAnimationFrame(flushDragUpdate);
      }
    },
    [flushDragUpdate],
  );

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const currentDragState = dragStateRef.current;

    if (currentDragState) {
      event.currentTarget.releasePointerCapture(currentDragState.pointerId);
    }

    dragStateRef.current = null;
    latestPointerRef.current = null;
    setDragState(null);
  }, []);

  const handleStartDrag = useCallback((event: PointerEvent<HTMLElement>, item: BoardItem) => {
    const itemRect = event.currentTarget.getBoundingClientRect();
    const nextDragState = {
      itemId: item.id,
      pointerId: event.pointerId,
      offsetX: event.clientX - itemRect.left,
      offsetY: event.clientY - itemRect.top,
    };

    setSelectedId(item.id);
    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
    boardRef.current?.setPointerCapture(event.pointerId);
  }, []);

  const handleGenerate = useCallback(
    (count: number) => {
      onItemCountChange(count);
      setItems(createItems(count, true));
      setSelectedId(null);
      setDragState(null);
      setPointerUpdates(0);
      dragStateRef.current = null;
      latestPointerRef.current = null;
      requestAnimationFrame(updateViewport);
    },
    [onItemCountChange, updateViewport],
  );

  const handleRunBenchmark = useCallback(() => {
    if (isBenchmarkRunning) {
      return;
    }

    setPointerUpdates(0);
    setSelectedId(null);
    setDragState(null);
    setBenchmarkResult(null);
    dragStateRef.current = null;
    latestPointerRef.current = null;
    resetOptimizedRenderCounter();
    setIsBenchmarkRunning(true);
    setBenchmarkStatus(`Recording for ${Math.round(benchmarkDurationMs / 1000)} seconds. Drag one card diagonally now.`);

    benchmarkTimeoutRef.current = window.setTimeout(() => {
      const latestStats = statsRef.current;
      setIsBenchmarkRunning(false);
      setDragState(null);
      dragStateRef.current = null;
      latestPointerRef.current = null;
      setBenchmarkResult({
        fps: latestStats.fps,
        averageFrameMs: latestStats.averageFrameMs,
        maxFrameMs: latestStats.maxFrameMs,
        appRenders: latestStats.renderCount,
        cardRenders: latestStats.cardRenders,
        pointerUpdates: latestStats.pointerUpdates,
      });
      setBenchmarkStatus('Run complete. Record FPS, frame time, renders, and pointer updates.');
    }, benchmarkDurationMs);
  }, [isBenchmarkRunning]);

  return (
    <main className="appShell" data-mode={mode}>
      <Toolbar
        mode={mode}
        itemCount={items.length}
        onModeChange={onModeChange}
        onGenerate={handleGenerate}
      />
      <section className="workspace">
        <OptimizedBoard
          items={visibleItems}
          selectedId={selectedId}
          draggingId={dragState?.itemId ?? null}
          neighborCounts={neighborCounts}
          boardRef={boardRef}
          showRenderHeat={showRenderHeat}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onScroll={updateViewport}
          onStartDrag={handleStartDrag}
        />
        <BenchmarkPanel
          mode={mode}
          itemCount={items.length}
          durationMs={benchmarkDurationMs}
          status={benchmarkStatus}
          isRunning={isBenchmarkRunning}
          result={benchmarkResult}
          showRenderHeat={showRenderHeat}
          onToggleRenderHeat={onToggleRenderHeat}
          onRunBenchmark={handleRunBenchmark}
        />
        <MetricsPanel mode={mode} stats={stats} />
      </section>
    </main>
  );
}
