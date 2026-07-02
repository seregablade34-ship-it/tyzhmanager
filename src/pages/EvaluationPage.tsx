import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { Goal, DescartesSquare, ThreePResult, CoachingSession, EisenhowerItem } from '../types'
import DescartesSquareForm from '../components/DescartesSquareForm'
import EisenhowerMatrix from '../components/EisenhowerMatrix'
import ThreePForm from '../components/ThreePForm'
import CoachingWizard from '../components/CoachingWizard'

// Экраны
type Screen = 'hub' | 'descartes' | 'eisenhower' | 'threeP' | 'coaching'

export default function EvaluationPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [screen, setScreen] = useState<Screen>('hub')
  const [isLoading, setIsLoading] = useState(true)

  // Данные инструментов (для отображения статуса)
  const [descartesData, setDescartesData] = useState<DescartesSquare[]>([])
  const [eisenhowerData, setEisenhowerData] = useState<EisenhowerItem[]>([])
  const [threePData, setThreePData] = useState<ThreePResult[]>([])
  const [coachingData, setCoachingData] = useState<CoachingSession[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [goalsArr, descArr, eisArr, tpArr, coachArr] = await Promise.all([
        db.goals.orderBy('order').toArray(),
        db.descartesSquares.toArray(),
        db.eisenhowerItems.toArray(),
        db.threePResults.toArray(),
        db.coachingSessions.toArray(),
      ])
      setGoals(goalsArr)
      setDescartesData(descArr)
      setEisenhowerData(eisArr)
      setThreePData(tpArr)
      setCoachingData(coachArr)
      if (goalsArr.length > 0 && !selectedGoalId) {
        setSelectedGoalId(goalsArr[0].id!)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null

  // Проверяем, есть ли данные по инструментам для выбранной цели
  function hasDescartes(): boolean {
    return descartesData.some(d => d.goalId === selectedGoalId)
  }
  function hasEisenhower(): boolean {
    return eisenhowerData.some(d => d.goalId === selectedGoalId)
  }
  function hasThreeP(): boolean {
    return threePData.some(d => d.goalId === selectedGoalId)
  }
  function hasCoaching(): boolean {
    return coachingData.some(d => d.goalId === selectedGoalId && d.isCompleted)
  }

  // Карточки инструментов
  const tools = [
    {
      id: 'descartes' as Screen,
      icon: '🔲',
      title: 'Квадрат Декарта',
      description: '4 вопроса помогут увидеть цель со всех сторон',
      done: hasDescartes(),
      color: 'border-primary/30 hover:border-primary',
    },
    {
      id: 'eisenhower' as Screen,
      icon: '📊',
      title: 'Матрица Эйзенхауэра',
      description: 'Определите важность и срочность каждой цели',
      done: hasEisenhower(),
      color: 'border-danger/30 hover:border-danger',
    },
    {
      id: 'threeP' as Screen,
      icon: '🎯',
      title: 'Метод 3П',
      description: 'Быстрый фильтр: Приближение, Последствия, Профит',
      done: hasThreeP(),
      color: 'border-success/30 hover:border-success',
    },
    {
      id: 'coaching' as Screen,
      icon: '🧠',
      title: 'Мини-самокоучинг',
      description: '10 вопросов для глубокой проработки цели',
      done: hasCoaching(),
      color: 'border-warning/30 hover:border-warning',
    },
  ]

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  // Нет целей
  if (goals.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-4">⚖️ Оценка целей</h1>
        <div className="text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-lg font-semibold text-text mb-2">
            Сначала создайте цель
          </h3>
          <p className="text-text-light">
            Перейдите в «Цели на год» и добавьте хотя бы одну цель.
          </p>
        </div>
      </div>
    )
  }

// Квадрат Декарта
  if (screen === 'descartes' && selectedGoal) {
    return (
      <DescartesSquareForm
        goalId={selectedGoal.id!}
        goalTitle={selectedGoal.title}
        onBack={() => { setScreen('hub'); loadData() }}
      />
    )
  }

  // Матрица Эйзенхауэра
  if (screen === 'eisenhower') {
    return (
      <EisenhowerMatrix
        onBack={() => { setScreen('hub'); loadData() }}
      />
    )
  }

  // Метод 3П
  if (screen === 'threeP' && selectedGoal) {
    return (
      <ThreePForm
        goalId={selectedGoal.id!}
        goalTitle={selectedGoal.title}
        onBack={() => { setScreen('hub'); loadData() }}
      />
    )
  }

  // Мини-самокоучинг
  if (screen === 'coaching' && selectedGoal) {
    return (
      <CoachingWizard
        goalId={selectedGoal.id!}
        goalTitle={selectedGoal.title}
        onBack={() => { setScreen('hub'); loadData() }}
      />
    )
  }
  
  // ХАБ — выбор инструмента
  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">⚖️ Оценка целей</h1>
        <p className="text-sm text-text-light mt-1">
          Оцените и приоритизируйте цели с помощью 4 инструментов
        </p>
      </div>

      {/* Выбор цели */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <label className="block text-sm font-medium text-text-light mb-2">
          Выберите цель для оценки:
        </label>
        <div className="grid gap-2">
          {goals.map(goal => {
            const isSelected = selectedGoalId === goal.id
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id!)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer
                  flex items-center justify-between
                  ${isSelected
                    ? 'bg-primary/10 border-2 border-primary text-text'
                    : 'bg-bg border-2 border-transparent text-text-light hover:bg-border'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <span className="text-xs text-text-light bg-surface px-2 py-0.5 rounded-full">
                    {goal.sphere}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4 инструмента */}
      {selectedGoal && (
        <div className="grid grid-cols-2 gap-4">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setScreen(tool.id)}
              className={`
                bg-surface border-2 ${tool.color} rounded-xl p-5
                text-left transition-all cursor-pointer hover:shadow-md
                relative
              `}
            >
              {/* Статус */}
              {tool.done && (
                <span className="absolute top-3 right-3 text-xs bg-success/10
                               text-success px-2 py-0.5 rounded-full font-medium">
                  ✅ Пройден
                </span>
              )}

              <p className="text-3xl mb-3">{tool.icon}</p>
              <h3 className="font-semibold text-text mb-1">{tool.title}</h3>
              <p className="text-xs text-text-light">{tool.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}