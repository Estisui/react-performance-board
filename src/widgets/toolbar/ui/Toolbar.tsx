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
          <button type="button" className="presetButton" onClick={() => onGenerate(80)}>
            <span className="presetName">Light</span>
            <span className="presetValue">80</span>
          </button>
          <button type="button" className="presetButton" onClick={() => onGenerate(DEFAULT_ITEM_COUNT)}>
            <span className="presetName">Standard</span>
            <span className="presetValue">{DEFAULT_ITEM_COUNT}</span>
          </button>
          <button type="button" className="presetButton" onClick={() => onGenerate(420)}>
            <span className="presetName">Stress</span>
            <span className="presetValue">420</span>
          </button>
        </div>
        <span className="itemCount">{itemCount} elements</span>
      </div>
    </header>
  );
}
