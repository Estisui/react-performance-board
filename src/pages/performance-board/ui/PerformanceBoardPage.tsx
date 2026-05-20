import type { BoardMode } from '../../../shared/config/boardMode';
import { BaselineBoardMode } from './BaselineBoardMode';

type PerformanceBoardPageProps = {
  mode: BoardMode;
  onModeChange: (mode: BoardMode) => void;
};

export function PerformanceBoardPage({ mode, onModeChange }: PerformanceBoardPageProps) {
  return <BaselineBoardMode mode={mode} onModeChange={onModeChange} />;
}

