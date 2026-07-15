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
  onSendToDaily?: (step: ActionStep, date: string) => void
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
  step, children, allSteps, onToggle, onAdd, onDelete, onEdit, onSendToDaily,
}: ActionStepItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [pickedDate, setPickedDate] = useState(() => new Date().toISOString().split('T')[0])

  const hasChildren = children.length > 0
  const colorClass = LEVEL_COLORS[Math.min(step.level, 4)]
  const dot = LEVEL_DOTS[Math.min(step.level, 4)]
  const completedChildren = children.filter(c => c.isCompleted).length
  const hasDetails = !!(step.description || step.actions || step.deadline)
  const maxLevel = 4

  function handleConfirmDate() {
    if (onSendToDaily && pickedDate) {
      onSendToDaily(step, pickedDate)
      setShowDatePicker(false)
    }
  }

  return (
    <div className="relative">
      <div className={`bg-surface border-l-4 ${colorClass} rounded-lg mb-2 hover:shadow-sm transition-shadow`}>

        {/* Компактная строка */}
        <div className="flex items-start gap-1.5 sm:gap-2 p-2 sm:p-3">

          {/* Expand / Dot */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-text-light hover:text-text transition-colors cursor-pointer text-xs flex-shrink-0 mt-0.5"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              {dot}
            </span>
          )}

          {/* Checkbox */}
          <button
            onClick={() => onToggle(step.id!, !step.isCompleted)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 mt-0.5 ${
              step.isCompleted ? 'bg-success border-success text-white' : 'border-border hover:border-primary'
            }`}
          >
            {step.isCompleted && <span className="text-xs">✓</span>}
          </button>

          {/* Название + мета */}
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setIsDetailOpen(!isDetailOpen)}
              className={`w-full text-left text-sm cursor-pointer hover:text-primary transition-colors ${
                step.isCompleted ? 'line-through text-text-light' : 'text-text'
              }`}
            >
              <span className="break-words overflow-wrap-anywhere">{step.title}</span>
              {hasDetails && (
                <span className="text-[10px] text-text-light ml-1">
                  {isDetailOpen ? '▾' : '▸'}
                </span>
              )}
            </button>

            {/* Прогресс дочерних — под названием */}
            {hasChildren && (
              <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${
                completedChildren === children.length
                  ? 'bg-success/10 text-success'
                  : 'bg-bg text-text-light'
              }`}>
                {completedChildren}/{children.length}
              </span>
            )}
          </div>

          {/* Кнопки действий — компактные */}
          <div className="flex gap-0 flex-shrink-0">
            {step.level < maxLevel && (
              <button
                onClick={() => onAdd(step.id!, step.level + 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded text-text-light hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="Добавить подзадачу"
              >
                <span className="text-xs">➕</span>
              </button>
            )}
            <button
              onClick={() => onEdit(step)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded text-text-light hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              title="Редактировать"
            >
              <span className="text-xs">✏️</span>
            </button>
            <button
              onClick={() => onDelete(step.id!)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded text-text-light hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              title="Удалить"
            >
              <span className="text-xs">🗑️</span>
            </button>
          </div>
        </div>

        {/* ═══ ДЕТАЛЬНЫЙ ВИД (3 блока) ═══ */}
        {isDetailOpen && (
          <div className="px-2 sm:px-3 pb-3 space-y-2 border-t border-border/50 pt-3 mx-2 sm:mx-3">
            {step.description && (
              <div className="bg-bg rounded-lg p-3">
                <p className="text-xs font-semibold text-text-light mb-1">📝 Описание</p>
                <p className="text-sm text-text leading-relaxed whitespace-pre-wrap break-words">{step.description}</p>
              </div>
            )}

            {step.actions && (
              <div className="bg-bg rounded-lg p-3">
                <p className="text-xs font-semibold text-text-light mb-1">🎯 Действия и намерения</p>
                <p className="text-sm text-text leading-relaxed whitespace-pre-wrap break-words">{step.actions}</p>
              </div>
            )}

            {/* Блок 3: Дата + В ежедневник с DatePicker */}
            <div className="bg-bg rounded-lg p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-text-light mb-1">📅 Дата</p>
                  {step.deadline ? (
                    <p className="text-sm text-text">{step.deadline}</p>
                  ) : (
                    <p className="text-xs text-text-light italic">Дедлайн не указан</p>
                  )}
                </div>
                {onSendToDaily && !step.isCompleted && (
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium flex items-center gap-1 self-start ${
                      showDatePicker
                        ? 'bg-primary text-white'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    📅 В ежедневник
                  </button>
                )}
              </div>

              {/* Встроенный DatePicker */}
              {showDatePicker && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-text-light mb-2">Выберите дату:</p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="date"
                      value={pickedDate}
                      onChange={(e) => setPickedDate(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                                 transition-colors text-sm cursor-pointer"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmDate}
                        className="flex-1 sm:flex-none px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90
                                   transition-colors cursor-pointer text-sm font-medium"
                      >
                        ✅ Добавить
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-3 py-2 bg-bg text-text-light rounded-lg hover:bg-border
                                   transition-colors cursor-pointer text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!hasDetails && (
              <p className="text-xs text-text-light italic text-center py-2">
                Нажмите ✏️ чтобы добавить описание и действия
              </p>
            )}
          </div>
        )}
      </div>

      {/* Дочерние элементы — МЕНЬШИЙ отступ на мобильном */}
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
                onSendToDaily={onSendToDaily}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}