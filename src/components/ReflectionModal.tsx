import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { GoalReflection } from '../types'

interface Props {
  // Что завершаем — цель или стратегию
  goalId?: number
  strategyId?: number
  title: string
  type: 'completed' | 'failed'
  onSave: () => void
  onCancel: () => void
}

// Вопросы при ВЫПОЛНЕНИИ
const COMPLETED_QUESTIONS = [
  {
    key: 'whatWorked',
    emoji: '🏆',
    label: 'Что помогло достичь цели?',
    placeholder: 'Какие действия, привычки, люди помогли вам?',
  },
  {
    key: 'whatLearned',
    emoji: '📚',
    label: 'Чему вы научились?',
    placeholder: 'Какие уроки вы извлекли из этого пути?',
  },
  {
    key: 'whatNext',
    emoji: '🚀',
    label: 'Что дальше? Какой следующий шаг?',
    placeholder: 'Как будете развивать этот успех?',
  },
]

// Вопросы при НЕВЫПОЛНЕНИИ
const FAILED_QUESTIONS = [
  {
    key: 'whatPrevented',
    emoji: '🚧',
    label: 'Что помешало?',
    placeholder: 'Какие препятствия возникли? Что пошло не так?',
  },
  {
    key: 'whatWouldChange',
    emoji: '🔄',
    label: 'Что бы вы сделали иначе?',
    placeholder: 'Если бы начинали сначала, что бы изменили?',
  },
  {
    key: 'isStillRelevant',
    emoji: '🤔',
    label: 'Цель всё ещё актуальна? Что дальше?',
    placeholder: 'Стоит ли вернуться к этой цели? Или двигаться дальше?',
  },
]

export default function ReflectionModal({
  goalId,
  strategyId,
  title,
  type,
  onSave,
  onCancel,
}: Props) {
  const questions = type === 'completed' ? COMPLETED_QUESTIONS : FAILED_QUESTIONS
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Загружаем существующую рефлексию (если редактируем)
  useEffect(() => {
    async function load() {
      try {
        let existing: GoalReflection | undefined

        if (goalId) {
          existing = await db.goalReflections
            .where('goalId')
            .equals(goalId)
            .first()
        } else if (strategyId) {
          existing = await db.goalReflections
            .where('strategyId')
            .equals(strategyId)
            .first()
        }

        if (existing) {
          const loaded: Record<string, string> = {}
          questions.forEach(q => {
            const val = existing![q.key as keyof GoalReflection]
            if (typeof val === 'string') {
              loaded[q.key] = val
            }
          })
          setAnswers(loaded)
        }
      } catch (error) {
        console.error('Ошибка загрузки рефлексии:', error)
      }
    }
    load()
  }, [goalId, strategyId])

  function updateAnswer(key: string, value: string) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  // Заполнен ли хотя бы 1 ответ
  const hasAnyAnswer = Object.values(answers).some(v => v.trim().length > 0)

  // Сохранение
  async function handleSave() {
    if (isSaving) return
    setIsSaving(true)

    try {
      const now = new Date().toISOString()

      const reflection: GoalReflection = {
        goalId,
        strategyId,
        type,
        createdAt: now,
        updatedAt: now,
      }

      // Заполняем ответы в зависимости от типа
      if (type === 'completed') {
        reflection.whatWorked = answers.whatWorked || ''
        reflection.whatLearned = answers.whatLearned || ''
        reflection.whatNext = answers.whatNext || ''
      } else {
        reflection.whatPrevented = answers.whatPrevented || ''
        reflection.whatWouldChange = answers.whatWouldChange || ''
        reflection.isStillRelevant = answers.isStillRelevant || ''
      }

      // Проверяем, есть ли уже рефлексия
      let existing: GoalReflection | undefined
      if (goalId) {
        existing = await db.goalReflections.where('goalId').equals(goalId).first()
      } else if (strategyId) {
        existing = await db.goalReflections.where('strategyId').equals(strategyId).first()
      }

      if (existing) {
        reflection.id = existing.id
        reflection.createdAt = existing.createdAt
        await db.goalReflections.put(reflection)
      } else {
        await db.goalReflections.add(reflection)
      }

      onSave()
    } catch (error) {
      console.error('Ошибка сохранения рефлексии:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Затемнение фона */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* Модальное окно */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4
                      border-2 border-primary/20 max-h-[90vh] overflow-y-auto">

        {/* Заголовок */}
        <div className={`p-5 border-b border-border rounded-t-2xl
          ${type === 'completed'
            ? 'bg-success/5'
            : 'bg-danger/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                {type === 'completed' ? '🎉 Цель достигнута!' : '📝 Рефлексия'}
              </h3>
              <p className="text-sm text-text-light mt-1">«{title}»</p>
            </div>
            <button
              onClick={onCancel}
              className="text-text-light hover:text-text text-xl cursor-pointer
                         w-8 h-8 flex items-center justify-center rounded-lg
                         hover:bg-bg transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-text-light mt-2">
            {type === 'completed'
              ? '💡 Ответьте на 3 вопроса — зафиксируйте свой успех!'
              : '💡 Ответьте на 3 вопроса — извлеките уроки.'
            }
          </p>
        </div>

        {/* Вопросы */}
        <div className="p-5 space-y-4">
          {questions.map(q => (
            <div key={q.key}>
              <label className="block text-sm font-medium text-text mb-1.5">
                {q.emoji} {q.label}
              </label>
              <textarea
                value={answers[q.key] || ''}
                onChange={(e) => updateAnswer(q.key, e.target.value)}
                placeholder={q.placeholder}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border
                           bg-bg text-text placeholder-text-light/50
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           focus:border-primary transition-colors resize-none text-sm"
              />
            </div>
          ))}
        </div>

        {/* Кнопки */}
        <div className="p-5 border-t border-border flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors cursor-pointer
              ${type === 'completed'
                ? 'bg-success text-white hover:bg-success/90'
                : 'bg-primary text-white hover:bg-primary-dark'
              }`}
          >
            {isSaving ? '⏳ Сохранение...' : '💾 Сохранить рефлексию'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-bg text-text-light rounded-lg
                       hover:bg-border transition-colors cursor-pointer"
          >
            {hasAnyAnswer ? 'Отмена' : 'Пропустить'}
          </button>
        </div>
      </div>
    </div>
  )
}