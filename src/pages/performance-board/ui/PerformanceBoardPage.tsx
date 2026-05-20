import { useRef, useState } from 'react';
import { DEFAULT_ITEM_COUNT } from '../../../entities/board';
import type { BoardMode } from '../../../shared/config/boardMode';
import { BaselineBoardMode, resetBaselineRenderCounter } from './BaselineBoardMode';
import { OptimizedBoardMode, resetOptimizedRenderCounter } from './OptimizedBoardMode';

type PerformanceBoardPageProps = {
  mode: BoardMode;
  onModeChange: (mode: BoardMode) => void;
};

export function PerformanceBoardPage({ mode, onModeChange }: PerformanceBoardPageProps) {
  const [itemCount, setItemCount] = useState(DEFAULT_ITEM_COUNT);
  const [showRenderHeat, setShowRenderHeat] = useState(false);
  const previousMode = useRef<BoardMode | null>(null);

  if (previousMode.current !== mode) {
    if (mode === 'optimized') {
      resetOptimizedRenderCounter();
    } else {
      resetBaselineRenderCounter();
    }

    previousMode.current = mode;
  }

  const handleToggleRenderHeat = () => {
    setShowRenderHeat((value) => !value);
  };

  if (mode === 'optimized') {
    return (
      <OptimizedBoardMode
        mode={mode}
        itemCount={itemCount}
        showRenderHeat={showRenderHeat}
        onItemCountChange={setItemCount}
        onModeChange={onModeChange}
        onToggleRenderHeat={handleToggleRenderHeat}
      />
    );
  }

  return (
    <BaselineBoardMode
      mode={mode}
      itemCount={itemCount}
      showRenderHeat={showRenderHeat}
      onItemCountChange={setItemCount}
      onModeChange={onModeChange}
      onToggleRenderHeat={handleToggleRenderHeat}
    />
  );
}
