import { useState } from 'react';
import { SlowBoardPage } from '../pages/slow-board';

export type BoardMode = 'baseline' | 'optimized';

export function App() {
  const [mode, setMode] = useState<BoardMode>('baseline');

  return <SlowBoardPage mode={mode} onModeChange={setMode} />;
}
