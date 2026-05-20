import { useState } from 'react';
import { PerformanceBoardPage } from '../pages/performance-board';
import type { BoardMode } from '../shared/config/boardMode';

export function App() {
  const [mode, setMode] = useState<BoardMode>('baseline');

  return <PerformanceBoardPage mode={mode} onModeChange={setMode} />;
}
