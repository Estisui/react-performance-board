import { BoardItem, BoardItemKind } from './types';

export const BOARD_WIDTH = 2800;
export const BOARD_HEIGHT = 1700;
export const DEFAULT_ITEM_COUNT = 180;

const ITEM_COLORS = [
  'rgba(220, 233, 245, 0.42)',
  'rgba(229, 240, 237, 0.4)',
  'rgba(241, 232, 215, 0.42)',
  'rgba(234, 223, 233, 0.4)',
  'rgba(220, 227, 241, 0.42)',
  'rgba(232, 236, 228, 0.4)',
];
const ITEM_KINDS: BoardItemKind[] = ['note', 'task', 'chart', 'warning'];

let nextId = 1;

export function createBoardItem(index: number): BoardItem {
  const column = index % 24;
  const row = Math.floor(index / 24);
  const width = 164 + (index % 4) * 16;
  const height = 132 + (index % 3) * 16;

  return {
    id: nextId++,
    x: 28 + column * 112 + (row % 2) * 18,
    y: 28 + row * 138,
    width,
    height,
    color: ITEM_COLORS[index % ITEM_COLORS.length],
    kind: ITEM_KINDS[index % ITEM_KINDS.length],
    title: `Элемент ${index + 1}`,
    body: 'Тестовая карточка рабочей области для проверки частых обновлений интерфейса.',
  };
}

export function createItems(count: number, resetIds = false): BoardItem[] {
  if (resetIds) {
    nextId = 1;
  }

  return Array.from({ length: count }, (_, index) => createBoardItem(index));
}
