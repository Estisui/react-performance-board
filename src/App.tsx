import { PointerEvent, RefObject, useEffect, useRef, useState } from 'react';

type BoardItemKind = 'note' | 'task' | 'chart' | 'warning';

type BoardItem = {
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

type DragState = {
  itemId: number;
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

type BoardStats = {
  renderCount: number;
  pointerUpdates: number;
  fps: number;
  selectedId: number | null;
  draggingId: number | null;
};

const BOARD_WIDTH = 2800;
const BOARD_HEIGHT = 1700;
const DEFAULT_ITEM_COUNT = 180;
const ITEM_COLORS = ['#f6c85f', '#7bdff2', '#b2f7ef', '#f7a1a1', '#cdb4db', '#bde0fe'];
const ITEM_KINDS: BoardItemKind[] = ['note', 'task', 'chart', 'warning'];

let nextId = 1;
let appRenderCounter = 0;

function createBoardItem(index: number): BoardItem {
  const column = index % 24;
  const row = Math.floor(index / 24);
  const width = 148 + (index % 4) * 18;
  const height = 108 + (index % 3) * 18;

  return {
    id: nextId++,
    x: 28 + column * 112 + (row % 2) * 18,
    y: 28 + row * 138,
    width,
    height,
    color: ITEM_COLORS[index % ITEM_COLORS.length],
    kind: ITEM_KINDS[index % ITEM_KINDS.length],
    title: `Card ${index + 1}`,
    body: `Элемент доски: frequent state updates, no memoization, render cost ${index % 7}.`,
  };
}

function createItems(count: number): BoardItem[] {
  return Array.from({ length: count }, (_, index) => createBoardItem(index));
}

function addSyntheticRenderCost(item: BoardItem, stats: BoardStats): number {
  let result = 0;
  const loops = 1450 + (item.id % 8) * 180 + (stats.pointerUpdates % 5) * 45;

  for (let i = 0; i < loops; i += 1) {
    result += Math.sqrt((item.x + item.y + i) % 997);
  }

  return Math.round(result);
}

export function App() {
  appRenderCounter += 1;

  const [items, setItems] = useState<BoardItem[]>(() => createItems(DEFAULT_ITEM_COUNT));
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pointerUpdates, setPointerUpdates] = useState(0);
  const [fps, setFps] = useState(60);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const frameTimes = useRef<number[]>([]);

  useEffect(() => {
    let frameHandle = 0;
    let lastTime = performance.now();

    const measureFrame = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      frameTimes.current = [...frameTimes.current.slice(-30), delta];
      const average = frameTimes.current.reduce((sum, value) => sum + value, 0) / frameTimes.current.length;
      setFps(Math.round(1000 / average));
      frameHandle = requestAnimationFrame(measureFrame);
    };

    frameHandle = requestAnimationFrame(measureFrame);

    return () => cancelAnimationFrame(frameHandle);
  }, []);

  const stats: BoardStats = {
    renderCount: appRenderCounter,
    pointerUpdates,
    fps,
    selectedId,
    draggingId: dragState?.itemId ?? null,
  };

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

  const handleAddItem = () => {
    setItems([...items, createBoardItem(items.length)]);
  };

  const handleRemoveSelected = () => {
    if (selectedId === null) {
      return;
    }

    setItems(items.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  const handleGenerate = (count: number) => {
    nextId = 1;
    setItems(createItems(count));
    setSelectedId(null);
    setDragState(null);
    setPointerUpdates(0);
  };

  return (
    <main className="appShell">
      <Toolbar
        itemCount={items.length}
        onAddItem={handleAddItem}
        onRemoveSelected={handleRemoveSelected}
        onGenerate={handleGenerate}
        selectedId={selectedId}
      />
      <section className="workspace">
        <Board
          items={items}
          stats={stats}
          boardRef={boardRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onStartDrag={handleStartDrag}
        />
        <MetricsPanel stats={stats} itemCount={items.length} />
      </section>
    </main>
  );
}

type ToolbarProps = {
  itemCount: number;
  selectedId: number | null;
  onAddItem: () => void;
  onRemoveSelected: () => void;
  onGenerate: (count: number) => void;
};

function Toolbar({ itemCount, selectedId, onAddItem, onRemoveSelected, onGenerate }: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="brandBlock">
        <span className="modePill">Slow / Базовый режим</span>
        <div>
          <h1>React Performance Board</h1>
          <p>Демонстрационная доска с намеренно неоптимизированными обновлениями состояния</p>
        </div>
      </div>

      <div className="toolbarActions">
        <button type="button" onClick={onAddItem}>
          Add card
        </button>
        <button type="button" onClick={onRemoveSelected} disabled={selectedId === null}>
          Remove selected
        </button>
        <button type="button" onClick={() => onGenerate(80)}>
          80
        </button>
        <button type="button" onClick={() => onGenerate(DEFAULT_ITEM_COUNT)}>
          {DEFAULT_ITEM_COUNT}
        </button>
        <button type="button" onClick={() => onGenerate(420)}>
          Heavy 420
        </button>
        <span className="itemCount">{itemCount} elements</span>
      </div>
    </header>
  );
}

type BoardProps = {
  items: BoardItem[];
  stats: BoardStats;
  boardRef: RefObject<HTMLDivElement | null>;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onStartDrag: (event: PointerEvent<HTMLElement>, item: BoardItem) => void;
};

function Board({ items, stats, boardRef, onPointerMove, onPointerUp, onStartDrag }: BoardProps) {
  return (
    <div
      className="boardViewport"
      ref={boardRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="boardCanvas" style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}>
        <div className="gridOverlay" />
        {items.map((item) => (
          <BoardCard key={item.id} item={item} stats={stats} allItems={items} onStartDrag={onStartDrag} />
        ))}
      </div>
    </div>
  );
}

type BoardCardProps = {
  item: BoardItem;
  stats: BoardStats;
  allItems: BoardItem[];
  onStartDrag: (event: PointerEvent<HTMLElement>, item: BoardItem) => void;
};

function BoardCard({ item, stats, allItems, onStartDrag }: BoardCardProps) {
  const syntheticValue = addSyntheticRenderCost(item, stats);
  const isSelected = stats.selectedId === item.id;
  const isDragging = stats.draggingId === item.id;
  const neighborCount = allItems.filter((candidate) => Math.abs(candidate.x - item.x) < 230).length;

  return (
    <article
      className={`boardCard ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        width: item.width,
        height: item.height,
        transform: `translate(${item.x}px, ${item.y}px)`,
        backgroundColor: item.color,
      }}
      onPointerDown={(event) => onStartDrag(event, item)}
    >
      <div className="cardTopline">
        <span>{item.kind}</span>
        <span>#{item.id}</span>
      </div>
      <h2>{item.title}</h2>
      <p>{item.body}</p>
      <footer>
        <span>near {neighborCount}</span>
        <span>cost {syntheticValue}</span>
      </footer>
    </article>
  );
}

type MetricsPanelProps = {
  stats: BoardStats;
  itemCount: number;
};

function MetricsPanel({ stats, itemCount }: MetricsPanelProps) {
  return (
    <aside className="metricsPanel" aria-label="Performance metrics">
      <h2>Metrics / Метрики</h2>
      <dl>
        <div>
          <dt>FPS</dt>
          <dd>{Number.isFinite(stats.fps) ? stats.fps : 0}</dd>
        </div>
        <div>
          <dt>App renders</dt>
          <dd>{stats.renderCount}</dd>
        </div>
        <div>
          <dt>Pointer updates</dt>
          <dd>{stats.pointerUpdates}</dd>
        </div>
        <div>
          <dt>Selected</dt>
          <dd>{stats.selectedId ?? 'none'}</dd>
        </div>
        <div>
          <dt>Dragging</dt>
          <dd>{stats.draggingId ?? 'none'}</dd>
        </div>
        <div>
          <dt>Elements</dt>
          <dd>{itemCount}</dd>
        </div>
      </dl>
      <p>
        Базовая версия специально хранит все элементы в одном состоянии и обновляет его при каждом движении
        указателя.
      </p>
    </aside>
  );
}
