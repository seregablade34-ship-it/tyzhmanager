import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { ThreePResult, ThreePPriority } from '../types'

interface Props {
  goalId: number
  goalTitle: string
  onBack: () => void
}

const QUESTIONS = [
  {
    key: 'approaching' as const,
    emoji: '🎯',
    title: 'Приближение',
    question: 'Это действие приближает вас к цели?',
  },
  {
    key: 'consequences' as const,
    emoji: '⚡',
    title: 'Последствия',
    question: 'Последствия бездействия будут критичны?',
  },
  {
    key: 'profit' as const,
    emoji: '💰',
    title: 'Профит',
    question: 'Есть ощутимая выгода от достижения?',
  },
]

// Результат по количеству ДА
function calcPriority(yes: number): {
  priority: ThreePPriority
  emoji: string
  title: string
  description: string
  color: string
} {
  switch (yes) {
    case 3:
      return {
        priority: 'absolute',
        emoji: '🔴',
        title: 'Абсолютный приоритет',
        description: 'Все три фактора подтверждены. Это важно — делайте!',
        color: 'border-danger/30 bg-danger/5 text-danger',
      }
    case 2:
      return {
        priority: 'high',
        emoji: '🟡',
        title: 'Высокий приоритет',
        description: 'Два из трёх факторов — запланируйте выполнение.',
        color: 'border-warning/30 bg-warning/5 text-warning',
      }
    case 1:
      return {
        priority: 'low',
        emoji: '⚪',
        title: 'Низкий приоритет',
        description: 'Только один фактор «за». Подумайте, стоит ли тратить ресурсы.',
        color: 'border-border bg-bg text-text-light',
      }
    default:
      return {
        priority: 'trash',
        emoji: '🗑️',
        title: 'Мусор',
        description: 'Ни один фактор не подтверждён. Откажитесь от этой цели.',
        color: 'border-text-light/30 bg-text-light/5 text-text-light',
      }
  }
}

export default function ThreePForm({ goalId, goalTitle, onBack }: Props) {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    approaching: null,
    consequences: null,
    profit: null,
  })
  const [existingId, setExistingId] = useState<number | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // Загрузка существующих данных
  useEffect(() => {
    async function load() {
      try {
        const existing = await db.threePResults
          .where('goalId')
          .equals(goalId)
          .first()

        if (existing) {
          setAnswers({
            approaching: existing.approaching,
            consequences: existing.consequences,
            profit: existing.profit,
          })
          setExistingId(existing.id!)
          setIsSaved(true)
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error)
      }
    }
    load()
  }, [goalId])

  // Установить ответ
  function setAnswer(key: string, value: boolean) {
    setAnswers(prev => ({ ...prev, [key]: value }))
    setIsSaved(false)
  }

  // Все ли вопросы отвечены?
  function isComplete(): boolean {
    return Object.values(answers).every(v => v !== null)
  }

  // Подсчёт ДА
  function yesCount(): number {
    return Object.values(answers).filter(v => v === true).length
  }

  // Результат
  const result = isComplete() ? calcPriority(yesCount()) : null

  // Сохранить
  async function handleSave() {
    if (!isComplete() || !result) return

    try {
      const now = new Date().toISOString()

      const record: ThreePResult = {
        goalId,
        approaching: answers.approaching!,
        consequences: answers.consequences!,
        profit: answers.profit!,
        priority: result.priority,
        createdAt: now,
        updatedAt: now,
      }

      if (existingId) {
        record.id = existingId
        await db.threePResults.put(record)
      } else {
        const id = await db.threePResults.add(record)
        setExistingId(id as number)
      }

      setIsSaved(true)
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Назад */}
      <button
        onClick={onBack}
        className="text-sm text-primary hover:text-primary-dark
                   transition-colors cursor-pointer mb-4 flex items-center gap-1"
      >
        ← Назад к инструментам
      </button>

      {/* Заголовок */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text">🎯 Метод 3П</h2>
        <p className="text-sm text-text-light mt-1">
          Цель: «{goalTitle}»
        </p>
        <p className="text-xs text-text-light mt-2">
          💡 Ответьте на 3 вопроса — ДА или НЕТ. Быстрый фильтр приоритетов.
        </p>
      </div>

      {/* 3 вопроса */}
      <div className="space-y-4 mb-6">
        {QUESTIONS.map(q => {
          const value = answers[q.key]

          return (
            <div
              key={q.key}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Вопрос */}
                <div className="flex-1">
                  <h3 className="font-semibold text-text mb-1">
                    {q.emoji} {q.title}
                  </h3>
                  <p className="text-sm text-text-light">
                    {q.question}
                  </p>
                </div>

                {/* Кнопки ДА / НЕТ */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setAnswer(q.key, true)}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer
                      ${value === true
                        ? 'bg-success text-white shadow-md scale-105'
                        : 'bg-bg border border-border text-text-light hover:bg-success/10 hover:text-success hover:border-success/30'
                      }`}
                  >
                    ✅ ДА
                  </button>
                  <button
                    onClick={() => setAnswer(q.key, false)}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer
                      ${value === false
                        ? 'bg-danger text-white shadow-md scale-105'
                        : 'bg-bg border border-border text-text-light hover:bg-danger/10 hover:text-danger hover:border-danger/30'
                      }`}
                  >
                    ❌ НЕТ
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Предпросмотр результата */}
      {result && (
        <div className={`border-2 rounded-xl p-6 text-center mb-6 ${result.color}`}>
          <p className="text-4xl mb-2">{result.emoji}</p>
          <h3 className="text-xl font-bold mb-2">{result.title}</h3>
          <p className="text-sm opacity-80">{result.description}</p>
          <div className="mt-3 text-xs opacity-60">
            Результат: {yesCount()} из 3 — ДА
          </div>
        </div>
      )}

      {/* Кнопка сохранения */}
      <div className="text-center">
        <button
          onClick={handleSave}
          disabled={!isComplete()}
          className={`px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer
            ${isComplete()
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-border text-text-light cursor-not-allowed'
            }`}
        >
          {isSaved ? '💾 Обновить результат' : '💾 Сохранить результат'}
        </button>

        {!isComplete() && (
          <p className="text-xs text-text-light mt-2">
            Ответьте на все 3 вопроса
          </p>
        )}

        {isSaved && (
          <p className="text-xs text-success mt-2">
            ✅ Результат сохранён
          </p>
        )}
      </div>
    </div>
  )
}