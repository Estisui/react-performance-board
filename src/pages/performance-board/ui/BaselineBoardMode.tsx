import { PointerEvent, useEffect, useRef, useState } from 'react';
import { Board, createItems, BOARD_HEIGHT, BOARD_WIDTH } from '../../../entities/board';
import { BoardItem, BoardStats, DragState } from '../../../entities/board/model/types';
import { getBenchmarkDurationMs } from '../../../shared/config/benchmark';
import type { BoardMode } from '../../../shared/config/boardMode';
import { getCardRenderCount, resetCardRenderCount, useFrameMetrics } from '../../../shared/lib/performance';
import { BenchmarkPanel } from '../../../widgets/benchmark-panel';
import type { BenchmarkResult } from '../../../widgets/benchmark-panel/ui/BenchmarkPanel';
import { MetricsPanel } from '../../../widgets/metrics-panel';
import { Toolbar } from '../../../widgets/toolbar';

let appRenderCounter = 0;

type BaselineBoardModeProps = {
  mode: BoardMode;
  itemCount: number;
  showRenderHeat: boolean;
  onItemCountChange: (count: number) => void;
  onModeChange: (mode: BoardMode) => void;
  onToggleRenderHeat: () => void;
};

export function resetBaselineRenderCounter() {
  appRenderCounter = 0;
  resetCardRenderCount('baseline');
}

export function BaselineBoardMode({
  mode,
  itemCount,
  showRenderHeat,
  onItemCountChange,
  onModeChange,
  onToggleRenderHeat,
}: BaselineBoardModeProps) {
  appRenderCounter += 1;
  const benchmarkDurationMs = getBenchmarkDurationMs();

  const [items, setItems] = useState<BoardItem[]>(() => createItems(itemCount, true));
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pointerUpdates, setPointerUpdates] = useState(0);
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState(false);
  const [benchmarkStatus, setBenchmarkStatus] = useState('Start a 10-second manual run, then drag one card.');
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const frameMetrics = useFrameMetrics();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const benchmarkTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (benchmarkTimeoutRef.current !== null) {
        window.clearTimeout(benchmarkTimeoutRef.current);
      }
    };
  }, []);

  const stats: BoardStats = {
    renderCount: appRenderCounter,
    cardRenders: getCardRenderCount('baseline'),
    pointerUpdates,
    fps: frameMetrics.fps,
    averageFrameMs: frameMetrics.averageFrameMs,
    maxFrameMs: frameMetrics.maxFrameMs,
    droppedFrames: frameMetrics.droppedFrames,
    selectedId,
    draggingId: dragState?.itemId ?? null,
  };
  const statsRef = useRef(stats);
  statsRef.current = stats;

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
          // Baseline behavior: copy unchanged items to break referential stability.
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
    onItemCountChange(count);
    setItems(createItems(count, true));
    setSelectedId(null);
    setDragState(null);
    setPointerUpdates(0);
  };

  const handleRunBenchmark = () => {
    if (isBenchmarkRunning) {
      return;
    }

    setPointerUpdates(0);
    setSelectedId(null);
    setDragState(null);
    setBenchmarkResult(null);
    resetBaselineRenderCounter();
    setIsBenchmarkRunning(true);
    setBenchmarkStatus(`Recording for ${Math.round(benchmarkDurationMs / 1000)} seconds. Drag one card diagonally now.`);

    benchmarkTimeoutRef.current = window.setTimeout(() => {
      const latestStats = statsRef.current;
      setIsBenchmarkRunning(false);
      setDragState(null);
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
          showRenderHeat={showRenderHeat}
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
