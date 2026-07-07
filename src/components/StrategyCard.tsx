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

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  active: { text: 'В работе', color: 'bg-primary/10 text-primary' },
  completed: { text: 'Достигнута', color: 'bg-success/10 text-success' },
  cancelled: { text: 'Не выполнена', color: 'bg-danger/10 text-danger' },
}

interface StrategyCardProps {
  strategy: Strategy
  onEdit: (strategy: Strategy) => void
  onDelete: (id: number) => void
  onComplete: (strategy: Strategy) => void
  onFail: (strategy: Strategy) => void
}

export default function StrategyCard({
  strategy,
  onEdit,
  onDelete,
  onComplete,
  onFail,
}: StrategyCardProps) {
  const icon = SPHERE_ICONS[strategy.sphere] || '🎯'
  const status = STATUS_LABELS[strategy.status] || STATUS_LABELS.active

  // Рамка карточки по статусу
  const borderClass =
    strategy.status === 'completed'
      ? 'border-success/30 bg-success/5'
      : strategy.status === 'cancelled'
        ? 'border-danger/30 bg-danger/5'
        : 'border-border'

  return (
    <div className={`bg-surface border rounded-xl p-4 hover:shadow-md transition-shadow ${borderClass}`}>
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className={`font-semibold ${
              strategy.status === 'completed'
                ? 'text-success'
                : strategy.status === 'cancelled'
                  ? 'text-text-light line-through'
                  : 'text-text'
            }`}>
              {strategy.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-light bg-bg px-2 py-0.5 rounded-full">
                {strategy.sphere}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                {status.text}
              </span>
            </div>
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

      {/* Описание */}
      {strategy.description && (
        <p className="text-sm text-text-light mt-2 leading-relaxed">
          {strategy.description}
        </p>
      )}

      {/* Горизонт */}
      <div className="mt-3 flex items-center gap-1 text-xs text-text-light">
        <span>📅</span>
        <span>Горизонт: {strategy.deadline}</span>
      </div>

      {/* ===== КНОПКИ ВЫПОЛНЕНО / НЕ ВЫПОЛНЕНО ===== */}
      {strategy.status === 'active' && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          <button
            onClick={() => onComplete(strategy)}
            className="flex-1 py-2 bg-success/10 text-success rounded-lg
                       hover:bg-success/20 transition-colors cursor-pointer
                       font-medium text-sm flex items-center justify-center gap-1.5"
          >
            ✅ Выполнено
          </button>
          <button
            onClick={() => onFail(strategy)}
            className="flex-1 py-2 bg-danger/10 text-danger rounded-lg
                       hover:bg-danger/20 transition-colors cursor-pointer
                       font-medium text-sm flex items-center justify-center gap-1.5"
          >
            ❌ Не выполнено
          </button>
        </div>
      )}

      {/* Метки для завершённых */}
      {strategy.status === 'completed' && (
        <div className="mt-3 pt-3 border-t border-success/20 text-center">
          <span className="text-sm text-success font-medium">
            🎉 Стратегия достигнута!
          </span>
        </div>
      )}

      {strategy.status === 'cancelled' && (
        <div className="mt-3 pt-3 border-t border-danger/20 text-center">
          <span className="text-sm text-text-light">
            📝 Стратегия не выполнена
          </span>
        </div>
      )}
    </div>
  )
}