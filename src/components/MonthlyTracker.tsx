import { useState } from 'react'
import type { MonthProgress } from '../types'

const MONTHS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
]

export function createEmptyMonthly(): MonthProgress[] {
  return Array.from({ length: 12 }, () => ({ checked: false, comment: '' }))
}

interface MonthlyTrackerProps {
  monthly: MonthProgress[]
  onChange: (updated: MonthProgress[]) => void
  disabled?: boolean
}

export default function MonthlyTracker({
  monthly,
  onChange,
  disabled = false,
}: MonthlyTrackerProps) {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null)

  const checkedCount = monthly.filter(m => m.checked).length

  function toggleMonth(index: number) {
    if (disabled) return
    const updated = [...monthly]
    updated[index] = { ...updated[index], checked: !updated[index].checked }
    onChange(updated)
  }

  function updateComment(index: number, comment: string) {
    const updated = [...monthly]
    updated[index] = { ...updated[index], comment }
    onChange(updated)
  }

  function toggleExpand(index: number) {
    setExpandedMonth(prev => (prev === index ? null : index))
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-light">
          📅 Прогресс по месяцам
        </span>
        <span className="text-xs text-text-light">
          {checkedCount} из 12
        </span>
      </div>

      {/* Сетка месяцев */}
      <div className="grid grid-cols-6 gap-1.5">
        {MONTHS.map((name, i) => {
          const month = monthly[i]
          const hasComment = month.comment.length > 0
          const isExpanded = expandedMonth === i

          return (
            <div key={i} className="flex flex-col gap-0.5">
              {/* Кнопка месяца — чекбокс */}
              <button
                onClick={() => toggleMonth(i)}
                disabled={disabled}
                className={`
                  relative py-1.5 text-xs rounded-md transition-all cursor-pointer
                  flex flex-col items-center gap-0.5
                  ${month.checked
                    ? 'bg-success/20 text-success border border-success/30'
                    : 'bg-bg text-text-light border border-border hover:border-primary/30'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className="font-medium">{name}</span>
                <span>{month.checked ? '✅' : '⬜'}</span>
                {hasComment && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </button>

              {/* Кнопка комментария — ВСЕГДА ВИДНА */}
              {!disabled && (
                <button
                  onClick={() => toggleExpand(i)}
                  className={`text-[11px] py-0.5 rounded transition-colors cursor-pointer
                    ${isExpanded
                      ? 'bg-primary/10 text-primary font-medium'
                      : hasComment
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-text-light hover:text-primary hover:bg-bg'
                    }`}
                >
                  {isExpanded ? '▲ скрыть' : hasComment ? '💬 есть' : '💬 +'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Раскрытый комментарий */}
      {expandedMonth !== null && (
        <div className="mt-3 p-3 bg-bg rounded-lg border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-text">
              💬 {MONTHS[expandedMonth]} — комментарий:
            </label>
            <button
              onClick={() => setExpandedMonth(null)}
              className="text-xs text-text-light hover:text-text cursor-pointer"
            >
              ✕
            </button>
          </div>
          <textarea
            value={monthly[expandedMonth].comment}
            onChange={e => updateComment(expandedMonth, e.target.value)}
            placeholder={`Что сделано / планы на ${MONTHS[expandedMonth].toLowerCase()}...`}
            rows={2}
            disabled={disabled}
            className="w-full px-2 py-1.5 text-sm border border-border rounded-md
                       bg-surface text-text resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary/30
                       placeholder-text-light/50"
          />
        </div>
      )}

      {/* Прогресс-бар */}
      <div className="mt-2 w-full h-1.5 bg-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-success rounded-full transition-all duration-300"
          style={{ width: `${Math.round((checkedCount / 12) * 100)}%` }}
        />
      </div>
    </div>
  )
}