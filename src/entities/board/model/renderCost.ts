import { BoardItem, BoardStats } from './types';

export function addSyntheticRenderCost(item: BoardItem, stats: BoardStats): number {
  let result = 0;
  const loops = 1450 + (item.id % 8) * 180 + (stats.pointerUpdates % 5) * 45;

  for (let i = 0; i < loops; i += 1) {
    result += Math.sqrt((item.x + item.y + i) % 997);
  }

  return Math.round(result);
}
