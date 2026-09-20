import { useState, useEffect } from 'react'
import { goalsTable, threePTable } from '../api/helpers'
import type { Goal, ThreePResult, ThreePPriority, GoalPriority } from '../types'

// Маппинг 3П → приоритет цели
function calcThreePPriority(a: boolean, c: boolean, p: boolean): ThreePPriority {
  const yes = [a, c, p].filter(Boolean).length
  if (yes === 3) return 'absolute'
  if (yes === 2) return 'high'
  if (yes === 1) return 'low'
  return 'trash'
}

function threePToGoalPriority(tp: ThreePPriority): GoalPriority {
  switch (tp) {
    case 'absolute': return 'absolute'
    case 'high': return 'high'
    case 'low': return 'medium'
    case 'trash': return 'low'
  }
}

const PRIORITY_LABELS: Record<ThreePPriority, { text: string; color: string; icon: string }> = {
  absolute: { text: 'Абсолютный приоритет', color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴' },
  high:     { text: 'Высокий приоритет',    color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🟠' },
  low:      { text: 'Средний приоритет',     color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🟡' },
  trash:    { text: 'Низкий приоритет',      color: 'bg-gray-100 text-gray-600 border-gray-300', icon: '⚪' },
}

const QUESTIONS = [
  {
    key: 'approaching' as const,
    icon: '🎯',
    title: 'Приближение',
    question: 'Эта цель приближает меня к желаемому будущему?',
    yesHint: 'Да — двигает вперёд',
    noHint: 'Нет — не влияет',
  },
  {
    key: 'consequences' as const,
    icon: '⚡',
    title: 'Последствия',
    question: 'Последствия бездействия будут критичны?',
    yesHint: 'Да — будет плохо',
    noHint: 'Нет — ничего страшного',
  },
  {
    key: 'profit' as const,
    icon: '💎',
    title: 'Профит',
    question: 'Есть ощутимая выгода от достижения?',
    yesHint: 'Да — выгода есть',
    noHint: 'Нет — выгоды мало',
  },
]

export default function ThreePPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [results, setResults] = useState<ThreePResult[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Текущие ответы
  const [approaching, setApproaching] = useState<boolean | null>(null)
  const [consequences, setConsequences] = useState<boolean | null>(null)
  const [profit, setProfit] = useState<boolean | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [goalsData, resultsData] = await Promise.all([
        goalsTable.getAll('order'),
        threePTable.getAll(),
      ])
      setGoals(goalsData)
      setResults(resultsData)

      if (!selectedGoalId && goalsData.length > 0) {
        setSelectedGoalId(goalsData[0].id!)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Загрузить существующий результат при выборе цели
  useEffect(() => {
    if (!selectedGoalId) return
    const existing = results.find(r => r.goalId === selectedGoalId)
    if (existing) {
      setApproaching(existing.approaching)
      setConsequences(existing.consequences)
      setProfit(existing.profit)
    } else {
      setApproaching(null)
      setConsequences(null)
      setProfit(null)
    }
  }, [selectedGoalId, results])

  const existingResult = results.find(r => r.goalId === selectedGoalId)
  const allAnswered = approaching !== null && consequences !== null && profit !== null
  const currentPriority = allAnswered
    ? calcThreePPriority(approaching!, consequences!, profit!)
    : null

  const goalsWithResult = new Set(results.map(r => r.goalId))

  // ===== СОХРАНИТЬ 3П + ОБНОВИТЬ ПРИОРИТЕТ ЦЕЛИ =====
  async function handleSave() {
    if (!selectedGoalId || !allAnswered) return

    try {
      const now = new Date().toISOString()
      const priority = calcThreePPriority(approaching!, consequences!, profit!)
      const goalPriority = threePToGoalPriority(priority)

      if (existingResult) {
        await threePTable.update(existingResult.id!, {
          approaching: approaching!,
          consequences: consequences!,
          profit: profit!,
          priority,
          updatedAt: now,
        })
      } else {
        await threePTable.create({
          goalId: selectedGoalId,
          approaching: approaching!,
          consequences: consequences!,
          profit: profit!,
          priority,
          createdAt: now,
          updatedAt: now,
        })
      }

      // Автоприоритет: обновляем цель
      await goalsTable.update(selectedGoalId, {
        priority: goalPriority,
        updatedAt: now,
      })

      await loadData()
    } catch (error) {
      console.error('Ошибка сохранения 3П:', error)
    }
  }

  // Удалить 3П
  async function handleDelete() {
    if (!existingResult) return
    const confirmed = window.confirm('Удалить оценку 3П для этой цели?')
    if (!confirmed) return

    try {
      await threePTable.remove(existingResult.id!)
      // Сброс приоритета цели
      await goalsTable.update(selectedGoalId!, {
        priority: 'medium',
        updatedAt: new Date().toISOString(),
      })
      setApproaching(null)
      setConsequences(null)
      setProfit(null)
      await loadData()
    } catch (error) {
      console.error('Ошибка удаления 3П:', error)
    }
  }

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-4">🧮 Метод 3П</h1>
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🎯</p>
          <h3 className="text-lg font-semibold text-text mb-2">Сначала создайте цель</h3>
          <p className="text-text-light">Перейдите в «Мои цели» и добавьте хотя бы одну.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text">🧮 Метод 3П</h1>
        <p className="text-sm text-text-light mt-1">
          Три вопроса — <b>Приближение, Последствия, Профит</b> — определяют приоритет цели
        </p>
      </div>

      {/* Выбор цели */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <label className="block text-sm font-medium text-text-light mb-2">Выберите цель:</label>
        <div className="grid gap-2">
          {goals.map(goal => {
            const hasResult = goalsWithResult.has(goal.id!)
            const isSelected = selectedGoalId === goal.id
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id!)}
                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all cursor-pointer
                  ${isSelected
                    ? 'bg-primary/10 border-2 border-primary text-text'
                    : 'bg-bg border-2 border-transparent text-text-light hover:bg-border'
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium flex-1 min-w-0 break-words">
                    {goal.title}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs text-text-light bg-surface px-2 py-0.5 rounded-full">
                      {goal.sphere}
                    </span>
                    {hasResult ? (
                      <span className="text-xs text-success font-medium">✅</span>
                    ) : (
                      <span className="text-xs text-text-light">—</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3П форма */}
      {selectedGoal && (
        <div className="bg-surface border border-border rounded-xl p-5">

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text">
              Оценка: «{selectedGoal.title}»
            </h2>
            {existingResult && (
              <button
                onClick={handleDelete}
                className="text-xs text-text-light hover:text-danger cursor-pointer
                           px-2 py-1 rounded hover:bg-danger/10 transition-colors"
              >
                🗑️ Удалить
              </button>
            )}
          </div>

          {/* 3 вопроса */}
          <div className="space-y-4 mb-6">
            {QUESTIONS.map(q => {
              const value = q.key === 'approaching' ? approaching
                : q.key === 'consequences' ? consequences
                : profit
              const setter = q.key === 'approaching' ? setApproaching
                : q.key === 'consequences' ? setConsequences
                : setProfit

              return (
                <div key={q.key} className="bg-bg rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{q.icon}</span>
                    <span className="text-sm font-bold text-text">{q.title}</span>
                  </div>
                  <p className="text-sm text-text mb-3">{q.question}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setter(true)}
                      className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer border-2
                        ${value === true
                          ? 'bg-success/15 border-success text-success'
                          : 'bg-surface border-border text-text-light hover:border-success/50'
                        }`}
                    >
                      ✅ {q.yesHint}
                    </button>
                    <button
                      onClick={() => setter(false)}
                      className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer border-2
                        ${value === false
                          ? 'bg-danger/15 border-danger text-danger'
                          : 'bg-surface border-border text-text-light hover:border-danger/50'
                        }`}
                    >
                      ❌ {q.noHint}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Результат */}
          {allAnswered && currentPriority && (
            <div className={`border-2 rounded-xl p-4 mb-4 text-center ${PRIORITY_LABELS[currentPriority].color}`}>
              <span className="text-3xl block mb-2">{PRIORITY_LABELS[currentPriority].icon}</span>
              <p className="font-bold text-lg">{PRIORITY_LABELS[currentPriority].text}</p>
              <p className="text-xs mt-1 opacity-75">
                {[approaching, consequences, profit].filter(Boolean).length} из 3 — ДА
              </p>
            </div>
          )}

          {/* Кнопка сохранить */}
          <button
            onClick={handleSave}
            disabled={!allAnswered}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-colors
              ${allAnswered
                ? 'bg-primary hover:bg-primary-dark cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            {existingResult ? '💾 Обновить оценку' : '💾 Сохранить оценку'}
          </button>

          {allAnswered && (
            <p className="text-xs text-text-light text-center mt-2">
              Приоритет цели обновится автоматически
            </p>
          )}
        </div>
      )}
    </div>
  )
}