export type BoardItemKind = 'note' | 'task' | 'chart' | 'warning';

export type BoardItem = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  kind: BoardItemKind;
  title: string;
  body: string;
};

export type DragState = {
  itemId: number;
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

export type BoardStats = {
  renderCount: number;
  pointerUpdates: number;
  fps: number;
  averageFrameMs: number;
  maxFrameMs: number;
  droppedFrames: number;
  selectedId: number | null;
  draggingId: number | null;
};
