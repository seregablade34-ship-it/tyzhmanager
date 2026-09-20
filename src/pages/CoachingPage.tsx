import { useState, useEffect } from 'react'
import { goalsTable, coachingTable } from '../api/helpers'
import type { Goal, CoachingSession } from '../types'

const QUESTIONS = [
  { icon: '🎯', title: 'Формулировка', question: 'Что конкретно я хочу достичь?' },
  { icon: '❤️', title: 'Мотивация', question: 'Почему эта цель важна для меня лично?' },
  { icon: '📏', title: 'Критерии', question: 'Как я пойму, что цель достигнута? Какие конкретные критерии успеха?' },
  { icon: '🧰', title: 'Ресурсы', question: 'Какие ресурсы у меня уже есть? (знания, навыки, связи, деньги)' },
  { icon: '🧱', title: 'Препятствия', question: 'Какие препятствия могут возникнуть на пути?' },
  { icon: '🛡️', title: 'Стратегия', question: 'Как я могу преодолеть каждое из этих препятствий?' },
  { icon: '🤝', title: 'Поддержка', question: 'Кто может помочь мне в достижении этой цели?' },
  { icon: '👣', title: 'Первый шаг', question: 'Какой самый первый конкретный шаг я могу сделать?' },
  { icon: '📅', title: 'Дедлайн старта', question: 'Когда именно я сделаю этот первый шаг?' },
  { icon: '📊', title: 'Контроль', question: 'Как я буду отслеживать свой прогресс?' },
]

export default function CoachingPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [sessions, setSessions] = useState<CoachingSession[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Wizard
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''))
  const [isEditing, setIsEditing] = useState(false)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [goalsData, sessionsData] = await Promise.all([
        goalsTable.getAll('order'),
        coachingTable.getAll(),
      ])
      setGoals(goalsData)
      setSessions(sessionsData)

      if (!selectedGoalId && goalsData.length > 0) {
        setSelectedGoalId(goalsData[0].id!)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Загрузить существующую сессию при выборе цели
  useEffect(() => {
    if (!selectedGoalId) return
    const existing = sessions.find(s => s.goalId === selectedGoalId)
    if (existing) {
      setAnswers(existing.answers || new Array(10).fill(''))
      setCurrentStep(existing.isCompleted ? 0 : existing.currentStep)
      setShowResult(existing.isCompleted)
      setIsEditing(false)
    } else {
      setAnswers(new Array(10).fill(''))
      setCurrentStep(0)
      setShowResult(false)
      setIsEditing(false)
    }
  }, [selectedGoalId, sessions])

  const existingSession = sessions.find(s => s.goalId === selectedGoalId)
  const goalsWithSession = new Set(sessions.map(s => s.goalId))
  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null

  // ===== СОХРАНИТЬ СЕССИЮ =====
  async function handleSave(completed: boolean) {
    if (!selectedGoalId) return

    try {
      const now = new Date().toISOString()

      if (existingSession) {
        await coachingTable.update(existingSession.id!, {
          answers,
          currentStep: completed ? 9 : currentStep,
          isCompleted: completed,
          updatedAt: now,
        })
      } else {
        await coachingTable.create({
          goalId: selectedGoalId,
          answers,
          currentStep: completed ? 9 : currentStep,
          isCompleted: completed,
          createdAt: now,
          updatedAt: now,
        })
      }

      await loadData()
      if (completed) {
        setShowResult(true)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  // Удалить сессию
  async function handleDelete() {
    if (!existingSession) return
    const confirmed = window.confirm('Удалить самокоучинг для этой цели?')
    if (!confirmed) return

    try {
      await coachingTable.remove(existingSession.id!)
      setAnswers(new Array(10).fill(''))
      setCurrentStep(0)
      setShowResult(false)
      setIsEditing(false)
      await loadData()
    } catch (error) {
      console.error('Ошибка удаления:', error)
    }
  }

  // Следующий вопрос
  function handleNext() {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSave(true)
    }
    // Автосохранение
    if (currentStep < 9) {
      handleSave(false)
    }
  }

  // Предыдущий вопрос
  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Обновить ответ
  function updateAnswer(value: string) {
    const newAnswers = [...answers]
    newAnswers[currentStep] = value
    setAnswers(newAnswers)
  }

  // Начать заново / редактировать
  function handleStartEditing() {
    setShowResult(false)
    setIsEditing(true)
    setCurrentStep(0)
  }

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
        <h1 className="text-2xl font-bold text-text mb-4">💬 Мини-самокоучинг</h1>
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
        <h1 className="text-xl sm:text-2xl font-bold text-text">💬 Мини-самокоучинг</h1>
        <p className="text-sm text-text-light mt-1">
          10 вопросов, которые помогут глубже осмыслить цель
        </p>
      </div>

      {/* Выбор цели */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <label className="block text-sm font-medium text-text-light mb-2">Выберите цель:</label>
        <div className="grid gap-2">
          {goals.map(goal => {
            const hasSession = goalsWithSession.has(goal.id!)
            const session = sessions.find(s => s.goalId === goal.id)
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
                    {hasSession ? (
                      <span className="text-xs font-medium">
                        {session?.isCompleted ? '✅' : `${(session?.currentStep || 0) + 1}/10`}
                      </span>
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

      {/* Контент */}
      {selectedGoal && (
        <>
          {/* ===== РЕЗУЛЬТАТ (все 10 отвечены) ===== */}
          {showResult && existingSession?.isCompleted && !isEditing ? (
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text">
                  ✅ Самокоучинг: «{selectedGoal.title}»
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={handleStartEditing}
                    className="text-xs text-text-light hover:text-primary cursor-pointer
                               px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                  >
                    ✏️ Править
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-text-light hover:text-danger cursor-pointer
                               px-2 py-1 rounded hover:bg-danger/10 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {QUESTIONS.map((q, i) => (
                  <div key={i} className="bg-bg rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{q.icon}</span>
                      <span className="text-xs font-bold text-primary">{q.title}</span>
                    </div>
                    <p className="text-sm text-text-light italic mb-1">{q.question}</p>
                    <p className="text-sm text-text leading-relaxed">
                      {answers[i] || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ===== WIZARD ===== */
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text text-sm">
                  «{selectedGoal.title}»
                </h2>
                {existingSession && (
                  <button
                    onClick={handleDelete}
                    className="text-xs text-text-light hover:text-danger cursor-pointer
                               px-2 py-1 rounded hover:bg-danger/10 transition-colors"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Прогресс */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / 10) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-text whitespace-nowrap">
                  {currentStep + 1}/10
                </span>
              </div>

              {/* Вопрос */}
              <div className="bg-bg rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{QUESTIONS[currentStep].icon}</span>
                  <span className="text-sm font-bold text-primary">
                    {QUESTIONS[currentStep].title}
                  </span>
                </div>
                <p className="text-text font-medium mb-3">
                  {QUESTIONS[currentStep].question}
                </p>
                <textarea
                  value={answers[currentStep]}
                  onChange={(e) => updateAnswer(e.target.value)}
                  placeholder="Ваш ответ..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border
                             bg-surface text-text placeholder-text-light/50
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition-colors resize-none"
                  autoFocus
                />
              </div>

              {/* Навигация */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors
                    ${currentStep === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-bg text-text-light hover:bg-border cursor-pointer'
                    }`}
                >
                  ← Назад
                </button>
                <button
                  onClick={handleNext}
                  disabled={!answers[currentStep]?.trim()}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors
                    ${!answers[currentStep]?.trim()
                      ? 'bg-gray-300 text-white cursor-not-allowed'
                      : currentStep === 9
                        ? 'bg-success text-white hover:bg-success/90 cursor-pointer'
                        : 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                    }`}
                >
                  {currentStep === 9 ? '✅ Завершить' : 'Далее →'}
                </button>
              </div>

              {/* Мини-навигация по точкам */}
              <div className="flex justify-center gap-1.5 mt-4">
                {QUESTIONS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-3 h-3 rounded-full transition-all cursor-pointer
                      ${i === currentStep
                        ? 'bg-primary scale-125'
                        : answers[i]?.trim()
                          ? 'bg-success/50'
                          : 'bg-border'
                      }`}
                    title={QUESTIONS[i].title}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}