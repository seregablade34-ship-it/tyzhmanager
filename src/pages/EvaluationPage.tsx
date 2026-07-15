import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { Goal, Strategy, DescartesSquare, ThreePResult, CoachingSession } from '../types'
import DescartesSquareForm from '../components/DescartesSquareForm'
import ThreePForm from '../components/ThreePForm'
import CoachingWizard from '../components/CoachingWizard'

type Screen = 'hub' | 'descartes' | 'threeP' | 'coaching'

const STRATEGY_OFFSET = 100000

export default function EvaluationPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [screen, setScreen] = useState<Screen>('hub')
  const [isLoading, setIsLoading] = useState(true)

  const [descartesData, setDescartesData] = useState<DescartesSquare[]>([])
  const [threePData, setThreePData] = useState<ThreePResult[]>([])
  const [coachingData, setCoachingData] = useState<CoachingSession[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [goalsArr, strategiesArr, descArr, tpArr, coachArr] = await Promise.all([
        db.goals.orderBy('order').toArray(),
        db.strategies.orderBy('order').toArray(),
        db.descartesSquares.toArray(),
        db.threePResults.toArray(),
        db.coachingSessions.toArray(),
      ])
      setGoals(goalsArr)
      setStrategies(strategiesArr)
      setDescartesData(descArr)
      setThreePData(tpArr)
      setCoachingData(coachArr)
      if ((goalsArr.length > 0 || strategiesArr.length > 0) && !selectedGoalId) {
        if (goalsArr.length > 0) {
          setSelectedGoalId(goalsArr[0].id!)
        } else {
          setSelectedGoalId(strategiesArr[0].id! + STRATEGY_OFFSET)
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function getSelectedTitle(): string {
    if (!selectedGoalId) return ''
    if (selectedGoalId >= STRATEGY_OFFSET) {
      const s = strategies.find(s => s.id === selectedGoalId - STRATEGY_OFFSET)
      return s?.title || ''
    }
    const g = goals.find(g => g.id === selectedGoalId)
    return g?.title || ''
  }

  function hasDescartes(): boolean {
    return descartesData.some(d => d.goalId === selectedGoalId)
  }
  function hasThreeP(): boolean {
    return threePData.some(d => d.goalId === selectedGoalId)
  }
  function hasCoaching(): boolean {
    return coachingData.some(d => d.goalId === selectedGoalId && d.isCompleted)
  }

  const toolsDone = [hasDescartes(), hasThreeP(), hasCoaching()].filter(Boolean).length

  // 3 инструмента в правильном порядке: 3П → Декарт → Коучинг
  const tools = [
    {
      id: 'threeP' as Screen,
      icon: '🎯',
      title: 'Метод 3П',
      description: 'Быстрый фильтр: Приближение, Последствия, Профит',
      done: hasThreeP(),
      color: 'border-success/30 hover:border-success',
    },
    {
      id: 'descartes' as Screen,
      icon: '📲',
      title: 'Квадрат Декарта',
      description: '4 вопроса помогут увидеть цель со всех сторон',
      done: hasDescartes(),
      color: 'border-primary/30 hover:border-primary',
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

  if (goals.length === 0 && strategies.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-4">⚖️ Оценка целей</h1>
        <div className="text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-lg font-semibold text-text mb-2">
            Сначала создайте цель
          </h3>
          <p className="text-text-light">
            Перейдите в «Цели на год» или «Стратегия 5 лет» и добавьте хотя бы одну цель.
          </p>
        </div>
      </div>
    )
  }

  if (screen === 'descartes' && selectedGoalId) {
    return (
      <DescartesSquareForm
        goalId={selectedGoalId}
        goalTitle={getSelectedTitle()}
        onBack={() => { setScreen('hub'); loadData() }}
      />
    )
  }

  if (screen === 'threeP' && selectedGoalId) {
    return (
      <ThreePForm
        goalId={selectedGoalId}
        goalTitle={getSelectedTitle()}
        onBack={() => { setScreen('hub'); loadData() }}
      />
    )
  }

  if (screen === 'coaching' && selectedGoalId) {
    return (
      <CoachingWizard
        goalId={selectedGoalId}
        goalTitle={getSelectedTitle()}
        onBack={() => { setScreen('hub'); loadData() }}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text">⚖️ Оценка целей</h1>
        <p className="text-sm text-text-light mt-1">
          Оцените и приоритизируйте цели с помощью 3 инструментов
        </p>
      </div>

      {/* Выбор цели */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <label className="block text-sm font-medium text-text-light mb-2">
          Выберите цель для оценки:
        </label>

        {goals.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-text-light mb-1.5">📋 Цели на год:</p>
            <div className="grid gap-1.5">
              {goals.map(goal => {
                const isSelected = selectedGoalId === goal.id
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoalId(goal.id!)}
                    className={`
                      w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all cursor-pointer
                      ${isSelected
                        ? 'bg-primary/10 border-2 border-primary text-text'
                        : 'bg-bg border-2 border-transparent text-text-light hover:bg-border'
                      }
                    `}
                  >
                    <span className="text-sm font-medium break-words">{goal.title}</span>
                    <span className="text-xs text-text-light bg-surface px-2 py-0.5 rounded-full ml-2">
                      {goal.sphere}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {strategies.length > 0 && (
          <div>
            <p className="text-xs font-medium text-text-light mb-1.5">🎯 Стратегия 5 лет:</p>
            <div className="grid gap-1.5">
              {strategies.map(strategy => {
                const virtualId = strategy.id! + STRATEGY_OFFSET
                const isSelected = selectedGoalId === virtualId
                return (
                  <button
                    key={virtualId}
                    onClick={() => setSelectedGoalId(virtualId)}
                    className={`
                      w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all cursor-pointer
                      ${isSelected
                        ? 'bg-primary/10 border-2 border-primary text-text'
                        : 'bg-bg border-2 border-transparent text-text-light hover:bg-border'
                      }
                    `}
                  >
                    <span className="text-sm font-medium break-words">{strategy.title}</span>
                    <span className="text-xs text-text-light bg-surface px-2 py-0.5 rounded-full ml-2">
                      {strategy.sphere}
                    </span>
                    <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full ml-1">
                      🎯 стратегия
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Прогресс оценки */}
      {selectedGoalId && toolsDone > 0 && (
        <div className="bg-surface border border-border rounded-xl p-3 mb-4
                        flex items-center justify-between">
          <span className="text-sm text-text-light">
            Прогресс оценки: <strong className="text-text">{toolsDone} из 3</strong> инструментов
          </span>
          <div className="w-24 h-2 bg-bg rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300
                         ${toolsDone === 3 ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${(toolsDone / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 3 инструмента — КОЛОНКА (не сетка!) */}
      {selectedGoalId && (
        <div className="space-y-3">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setScreen(tool.id)}
              className={`
                w-full bg-surface border-2 ${tool.color} rounded-xl p-4
                text-left transition-all cursor-pointer hover:shadow-md
                flex items-center gap-4 relative
              `}
            >
              {/* Иконка */}
              <span className="text-3xl flex-shrink-0">{tool.icon}</span>

              {/* Текст */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text text-sm sm:text-base">{tool.title}</h3>
                <p className="text-xs text-text-light mt-0.5 break-words">{tool.description}</p>
              </div>

              {/* Статус */}
              {tool.done && (
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  ✅ Пройден
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}