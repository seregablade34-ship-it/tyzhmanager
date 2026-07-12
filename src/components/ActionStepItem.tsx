import { useState } from 'react'
import type { ActionStep } from '../types'

interface ActionStepItemProps {
  step: ActionStep
  children: ActionStep[]
  allSteps: ActionStep[]
  onToggle: (id: number, isCompleted: boolean) => void
  onAdd: (parentId: number, level: number) => void
  onDelete: (id: number) => void
  onEdit: (step: ActionStep) => void
}

const LEVEL_COLORS = [
  'border-primary/40',
  'border-success/40',
  'border-warning/40',
  'border-danger/40',
  'border-text-light/40',
]

const LEVEL_DOTS = ['🔵', '🟢', '🟡', '🔴', '⚪']

export default function ActionStepItem({
  step,
  children,
  allSteps,
  onToggle,
  onAdd,
  onDelete,
  onEdit,
}: ActionStepItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const hasChildren = children.length > 0
  const colorClass = LEVEL_COLORS[Math.min(step.level, 4)]
  const dot = LEVEL_DOTS[Math.min(step.level, 4)]

  const completedChildren = children.filter(c => c.isCompleted).length
  const childProgress = hasChildren
    ? Math.round((completedChildren / children.length) * 100)
    : null

  const maxLevel = 4

  return (
    <div className="relative">
      {/* Основной элемент */}
      <div
        className={`bg-surface border-l-4 ${colorClass} rounded-lg p-2 sm:p-3 mb-2
                    hover:shadow-sm transition-shadow`}
      >
        {/* Верхняя строка: expand + checkbox + название */}
        <div className="flex items-start gap-1.5 sm:gap-2">
          {/* Раскрытие/скрытие дочерних */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center
                         text-text-light hover:text-text transition-colors
                         cursor-pointer text-xs flex-shrink-0 mt-0.5"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              {dot}
            </span>
          )}

          {/* Чекбокс */}
          <button
            onClick={() => onToggle(step.id!, !step.isCompleted)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center
                       transition-all cursor-pointer flex-shrink-0 mt-0.5
                       ${step.isCompleted
                         ? 'bg-success border-success text-white'
                         : 'border-border hover:border-primary'
                       }`}
          >
            {step.isCompleted && (
              <span className="text-xs">✓</span>
            )}
          </button>

          {/* Название + метаданные */}
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm break-words ${
                step.isCompleted
                  ? 'line-through text-text-light'
                  : 'text-text'
              }`}
            >
              {step.title}
            </span>

            {/* Прогресс + дедлайн — под названием на мобильном */}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {childProgress !== null && (
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full
                                 ${childProgress === 100
                                   ? 'bg-success/10 text-success'
                                   : 'bg-bg text-text-light'
                                 }`}>
                  {completedChildren}/{children.length}
                </span>
              )}

              {step.deadline && (
                <span className="text-xs text-text-light">
                  📅 {step.deadline}
                </span>
              )}
            </div>
          </div>

          {/* Кнопки действий — компактные */}
          <div className="flex gap-0 sm:gap-0.5 flex-shrink-0">
            {step.level < maxLevel && (
              <button
                onClick={() => onAdd(step.id!, step.level + 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded
                           text-text-light hover:text-primary hover:bg-primary/10
                           transition-colors cursor-pointer"
                title="Добавить подзадачу"
              >
                <span className="text-xs">➕</span>
              </button>
            )}

            <button
              onClick={() => onEdit(step)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded
                         text-text-light hover:text-primary hover:bg-primary/10
                         transition-colors cursor-pointer"
              title="Редактировать"
            >
              <span className="text-xs">✏️</span>
            </button>

            <button
              onClick={() => onDelete(step.id!)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded
                         text-text-light hover:text-danger hover:bg-danger/10
                         transition-colors cursor-pointer"
              title="Удалить"
            >
              <span className="text-xs">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Дочерние элементы (рекурсия) — меньший отступ на мобильном */}
      {hasChildren && isExpanded && (
        <div className="ml-3 sm:ml-6 mt-1">
          {children.map(child => {
            const grandChildren = allSteps.filter(s => s.parentId === child.id)
            return (
              <ActionStepItem
                key={child.id}
                step={child}
                children={grandChildren}
                allSteps={allSteps}
                onToggle={onToggle}
                onAdd={onAdd}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}