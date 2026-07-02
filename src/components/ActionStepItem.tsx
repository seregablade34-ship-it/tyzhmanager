import { useState } from 'react'
import type { ActionStep } from '../types'

interface ActionStepItemProps {
  step: ActionStep
  children: ActionStep[]    // Дочерние шаги
  allSteps: ActionStep[]    // Все шаги (для рекурсии)
  onToggle: (id: number, isCompleted: boolean) => void
  onAdd: (parentId: number, level: number) => void
  onDelete: (id: number) => void
  onEdit: (step: ActionStep) => void
}

// Цвета по уровню вложенности
const LEVEL_COLORS = [
  'border-primary/40',     // Уровень 0 — синий
  'border-success/40',     // Уровень 1 — зелёный
  'border-warning/40',     // Уровень 2 — жёлтый
  'border-danger/40',      // Уровень 3 — красный
  'border-text-light/40',  // Уровень 4+ — серый
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

  // Считаем прогресс дочерних
  const completedChildren = children.filter(c => c.isCompleted).length
  const childProgress = hasChildren
    ? Math.round((completedChildren / children.length) * 100)
    : null

  // Максимальный уровень вложенности
  const maxLevel = 4

  return (
    <div className="relative">
      {/* Основной элемент */}
      <div
        className={`bg-surface border-l-4 ${colorClass} rounded-lg p-3 mb-2
                    hover:shadow-sm transition-shadow`}
      >
        <div className="flex items-center gap-2">
          {/* Раскрытие/скрытие дочерних */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-6 h-6 flex items-center justify-center
                         text-text-light hover:text-text transition-colors
                         cursor-pointer text-xs"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="w-6 h-6 flex items-center justify-center text-xs">
              {dot}
            </span>
          )}

          {/* Чекбокс */}
          <button
            onClick={() => onToggle(step.id!, !step.isCompleted)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center
                       transition-all cursor-pointer flex-shrink-0
                       ${step.isCompleted
                         ? 'bg-success border-success text-white'
                         : 'border-border hover:border-primary'
                       }`}
          >
            {step.isCompleted && (
              <span className="text-xs">✓</span>
            )}
          </button>

          {/* Название */}
          <span
            className={`flex-1 text-sm ${
              step.isCompleted
                ? 'line-through text-text-light'
                : 'text-text'
            }`}
          >
            {step.title}
          </span>

          {/* Прогресс дочерних */}
          {childProgress !== null && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                             ${childProgress === 100
                               ? 'bg-success/10 text-success'
                               : 'bg-bg text-text-light'
                             }`}>
              {completedChildren}/{children.length}
            </span>
          )}

          {/* Дедлайн */}
          {step.deadline && (
            <span className="text-xs text-text-light">
              📅 {step.deadline}
            </span>
          )}

          {/* Кнопки действий */}
          <div className="flex gap-0.5 ml-1">
            {/* Добавить подзадачу (если не максимальный уровень) */}
            {step.level < maxLevel && (
              <button
                onClick={() => onAdd(step.id!, step.level + 1)}
                className="w-7 h-7 flex items-center justify-center rounded
                           text-text-light hover:text-primary hover:bg-primary/10
                           transition-colors cursor-pointer"
                title="Добавить подзадачу"
              >
                <span className="text-xs">➕</span>
              </button>
            )}

            {/* Редактировать */}
            <button
              onClick={() => onEdit(step)}
              className="w-7 h-7 flex items-center justify-center rounded
                         text-text-light hover:text-primary hover:bg-primary/10
                         transition-colors cursor-pointer"
              title="Редактировать"
            >
              <span className="text-xs">✏️</span>
            </button>

            {/* Удалить */}
            <button
              onClick={() => onDelete(step.id!)}
              className="w-7 h-7 flex items-center justify-center rounded
                         text-text-light hover:text-danger hover:bg-danger/10
                         transition-colors cursor-pointer"
              title="Удалить"
            >
              <span className="text-xs">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Дочерние элементы (рекурсия) */}
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-1">
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