import { DEFAULT_ITEM_COUNT } from '../../../entities/board';
import type { BoardMode } from '../../../shared/config/boardMode';

type ToolbarProps = {
  mode: BoardMode;
  itemCount: number;
  onModeChange: (mode: BoardMode) => void;
  onGenerate: (count: number) => void;
};

export function Toolbar({ mode, itemCount, onModeChange, onGenerate }: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="brandBlock">
        <div>
          <h1>React Performance Board</h1>
          <p>Демонстрационная доска с намеренно неоптимизированными обновлениями состояния</p>
        </div>
      </div>

      <div className="toolbarActions">
        <div className="modeSwitch" aria-label="Режим работы">
          <button
            type="button"
            className={mode === 'baseline' ? 'active' : ''}
            aria-pressed={mode === 'baseline'}
            onClick={() => onModeChange('baseline')}
          >
            Baseline
          </button>
          <button
            type="button"
            className={mode === 'optimized' ? 'active' : ''}
            aria-pressed={mode === 'optimized'}
            onClick={() => onModeChange('optimized')}
          >
            Optimized
          </button>
        </div>
        <div className="presetGroup" aria-label="Количество элементов">
          <button
            type="button"
            className={`presetButton ${itemCount === 80 ? 'active' : ''}`}
            aria-pressed={itemCount === 80}
            onClick={() => onGenerate(80)}
          >
            <span className="presetName">Light</span>
            <span className="presetValue">80</span>
          </button>
          <button
            type="button"
            className={`presetButton ${itemCount === DEFAULT_ITEM_COUNT ? 'active' : ''}`}
            aria-pressed={itemCount === DEFAULT_ITEM_COUNT}
            onClick={() => onGenerate(DEFAULT_ITEM_COUNT)}
          >
            <span className="presetName">Standard</span>
            <span className="presetValue">{DEFAULT_ITEM_COUNT}</span>
          </button>
          <button
            type="button"
            className={`presetButton ${itemCount === 420 ? 'active' : ''}`}
            aria-pressed={itemCount === 420}
            onClick={() => onGenerate(420)}
          >
            <span className="presetName">Stress</span>
            <span className="presetValue">420</span>
          </button>
        </div>
      </div>
    </header>
  );
}
