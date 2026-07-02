import type { Goal } from '../types'

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
  cancelled: { text: 'Отменена', color: 'bg-danger/10 text-danger' },
}

interface GoalCardProps {
  goal: Goal
  strategyTitle?: string
  onEdit: (goal: Goal) => void
  onDelete: (id: number) => void
  onProgressChange: (id: number, progress: number) => void
}

export default function GoalCard({
  goal,
  strategyTitle,
  onEdit,
  onDelete,
  onProgressChange,
}: GoalCardProps) {
  const icon = SPHERE_ICONS[goal.sphere] || '🎯'
  const status = STATUS_LABELS[goal.status] || STATUS_LABELS.active

  // Цвет прогресс-бара
  function getProgressColor(progress: number): string {
    if (progress >= 80) return 'bg-success'
    if (progress >= 50) return 'bg-primary'
    if (progress >= 25) return 'bg-warning'
    return 'bg-energy-gray'
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-text">{goal.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-light bg-bg px-2 py-0.5 rounded-full">
                {goal.sphere}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                {status.text}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-text-light hover:text-primary hover:bg-primary/10
                       transition-colors cursor-pointer text-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(goal.id!)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-text-light hover:text-danger hover:bg-danger/10
                       transition-colors cursor-pointer text-sm"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Описание */}
      {goal.description && (
        <p className="text-sm text-text-light mt-2 leading-relaxed">
          {goal.description}
        </p>
      )}

      {/* Связь со стратегией */}
      {strategyTitle && (
        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
          <span>🔗</span>
          <span>{strategyTitle}</span>
        </div>
      )}

      {/* Прогресс */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-light">Прогресс</span>
          <span className="text-xs font-bold text-text">{goal.progress}%</span>
        </div>

        {/* Прогресс-бар */}
        <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>

        {/* Быстрые кнопки прогресса */}
        {goal.status === 'active' && (
          <div className="flex gap-1 mt-2">
            {[0, 25, 50, 75, 100].map(p => (
              <button
                key={p}
                onClick={() => onProgressChange(goal.id!, p)}
                className={`flex-1 py-1 text-xs rounded-md cursor-pointer transition-colors
                  ${goal.progress === p
                    ? 'bg-primary text-white'
                    : 'bg-bg text-text-light hover:bg-border'
                  }`}
              >
                {p}%
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}