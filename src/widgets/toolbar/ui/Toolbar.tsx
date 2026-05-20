import { DEFAULT_ITEM_COUNT } from '../../../entities/board';

type ToolbarProps = {
  itemCount: number;
  onGenerate: (count: number) => void;
};

export function Toolbar({ itemCount, onGenerate }: ToolbarProps) {
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
        <div className="presetGroup" aria-label="Количество элементов">
          <button type="button" onClick={() => onGenerate(80)}>
            80
          </button>
          <button type="button" onClick={() => onGenerate(DEFAULT_ITEM_COUNT)}>
            {DEFAULT_ITEM_COUNT}
          </button>
          <button type="button" onClick={() => onGenerate(420)}>
            Heavy 420
          </button>
        </div>
        <span className="itemCount">{itemCount} elements</span>
      </div>
    </header>
  );
}
