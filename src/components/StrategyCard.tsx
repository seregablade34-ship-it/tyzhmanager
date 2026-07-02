import type { Strategy } from '../types'

const SPHERE_ICONS: Record<string, string> = {
  'Здоровье': '💪',
  'Карьера': '💼',
  'Финансы': '💰',
  'Отношения': '❤️',
  'Семья': '👨‍👩‍👧‍👦',
  'Развитие': '📚',
  'Хобби': '🎨',
  'Духовность': '🧘',
}

interface StrategyCardProps {
  strategy: Strategy
  onEdit: (strategy: Strategy) => void
  onDelete: (id: number) => void
}

export default function StrategyCard({ strategy, onEdit, onDelete }: StrategyCardProps) {
  const icon = SPHERE_ICONS[strategy.sphere] || '🎯'

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-text">{strategy.title}</h3>
            <span className="text-xs text-text-light bg-bg px-2 py-0.5 rounded-full">
              {strategy.sphere}
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(strategy)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-text-light hover:text-primary hover:bg-primary/10
                       transition-colors cursor-pointer text-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(strategy.id!)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-text-light hover:text-danger hover:bg-danger/10
                       transition-colors cursor-pointer text-sm"
          >
            🗑️
          </button>
        </div>
      </div>

      {strategy.description && (
        <p className="text-sm text-text-light mt-2 leading-relaxed">
          {strategy.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-1 text-xs text-text-light">
        <span>📅</span>
        <span>Горизонт: {strategy.deadline}</span>
      </div>
    </div>
  )
}