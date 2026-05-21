import type { BoardMode } from '../../config/boardMode';

const cardRenderCounts: Record<BoardMode, number> = {
  baseline: 0,
  optimized: 0,
};

export function incrementCardRenderCount(mode: BoardMode) {
  cardRenderCounts[mode] += 1;
}

export function getCardRenderCount(mode: BoardMode) {
  return cardRenderCounts[mode];
}

export function resetCardRenderCount(mode: BoardMode) {
  cardRenderCounts[mode] = 0;
}

