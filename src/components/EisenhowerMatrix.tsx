import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { Goal, EisenhowerItem, EisenhowerQuadrant } from '../types'

interface Props {
  onBack: () => void
}

const QUADRANTS: {
  id: EisenhowerQuadrant
  emoji: string
  title: string
  subtitle: string
  color: string
  bgColor: string
  borderColor: string
}[] = [
  {
    id: 'urgent-important',
    emoji: '🔴',
    title: 'Важно и Срочно',
    subtitle: 'Делай сейчас!',
    color: 'text-danger',
    bgColor: 'bg-danger/5',
    borderColor: 'border-danger/30',
  },
  {
    id: 'not-urgent-important',
    emoji: '🟡',
    title: 'Важно, но Не срочно',
    subtitle: 'Запланируй',
    color: 'text-warning',
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/30',
  },
  {
    id: 'urgent-not-important',
    emoji: '🔵',
    title: 'Срочно, но Не важно',
    subtitle: 'Делегируй',
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/30',
  },
  {
    id: 'not-urgent-not-important',
    emoji: '⚪',
    title: 'Не важно и Не срочно',
    subtitle: 'Подумай, нужно ли',
    color: 'text-text-light',
    bgColor: 'bg-bg',
    borderColor: 'border-border',
  },
]

export default function EisenhowerMatrix({ onBack }: Props) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [assignments, setAssignments] = useState<Record<number, EisenhowerQuadrant>>({})
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [goalsArr, eisenArr] = await Promise.all([
        db.goals.orderBy('order').toArray(),
        db.eisenhowerItems.toArray(),
      ])
      setGoals(goalsArr)

      // Загружаем существующие присвоения
      const existing: Record<number, EisenhowerQuadrant> = {}
      eisenArr.forEach(item => {
        existing[item.goalId] = item.quadrant
      })
      setAssignments(existing)

      if (eisenArr.length > 0) {
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Назначить цель в квадрант
  function assignGoal(goalId: number, quadrant: EisenhowerQuadrant) {
    setAssignments(prev => {
      const updated = { ...prev }
      // Если уже в этом квадранте — убрать
      if (updated[goalId] === quadrant) {
        delete updated[goalId]
      } else {
        updated[goalId] = quadrant
      }
      return updated
    })
    setIsSaved(false)
  }

  // Сохранить
  async function handleSave() {
    try {
      const now = new Date().toISOString()

      // Удаляем старые записи
      await db.eisenhowerItems.clear()

      // Добавляем новые
      const items: EisenhowerItem[] = Object.entries(assignments).map(
        ([goalId, quadrant]) => ({
          goalId: Number(goalId),
          quadrant,
          createdAt: now,
          updatedAt: now,
        })
      )

      await db.eisenhowerItems.bulkAdd(items)
      setIsSaved(true)
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  // Цели, не распределённые по квадрантам
  const unassignedGoals = goals.filter(g => !assignments[g.id!])

  // Цели в конкретном квадранте
  function goalsInQuadrant(quadrant: EisenhowerQuadrant): Goal[] {
    return goals.filter(g => assignments[g.id!] === quadrant)
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="text-sm text-primary hover:text-primary-dark
                     transition-colors cursor-pointer mb-4"
        >
          ← Назад к инструментам
        </button>
        <div className="text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-lg font-semibold text-text mb-2">Нет целей</h3>
          <p className="text-text-light">
            Создайте цели в разделе «Цели на год».
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
        <h2 className="text-2xl font-bold text-text">📊 Матрица Эйзенхауэра</h2>
        <p className="text-sm text-text-light mt-1">
          Распределите цели по квадрантам: нажимайте на цель, затем на квадрант
        </p>
      </div>

      {/* Нераспределённые цели */}
      {unassignedGoals.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-text-light mb-3">
            📋 Нераспределённые цели ({unassignedGoals.length}):
          </h3>
          <div className="flex flex-wrap gap-2">
            {unassignedGoals.map(goal => (
              <span
                key={goal.id}
                className="px-3 py-1.5 bg-bg border border-border rounded-lg
                           text-sm text-text"
              >
                {goal.title}
                <span className="text-xs text-text-light ml-1">({goal.sphere})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Матрица 2×2 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Заголовки столбцов */}
        <div className="col-span-2 grid grid-cols-[auto_1fr_1fr] gap-3 items-end">
          <div className="w-24"></div>
          <p className="text-center text-xs font-semibold text-danger uppercase tracking-wider">
            ⏰ Срочно
          </p>
          <p className="text-center text-xs font-semibold text-text-light uppercase tracking-wider">
            📅 Не срочно
          </p>
        </div>

        {/* Строка 1: Важно */}
        <div className="col-span-2 grid grid-cols-[auto_1fr_1fr] gap-3">
          <div className="w-24 flex items-center">
            <p className="text-xs font-semibold text-warning uppercase tracking-wider
                         -rotate-90 whitespace-nowrap origin-center">
              ⭐ Важно
            </p>
          </div>

          {/* 🔴 Важно + Срочно */}
          <QuadrantBox
            config={QUADRANTS[0]}
            goals={goalsInQuadrant('urgent-important')}
            allGoals={goals}
            onAssign={(goalId) => assignGoal(goalId, 'urgent-important')}
          />

          {/* 🟡 Важно + Не срочно */}
          <QuadrantBox
            config={QUADRANTS[1]}
            goals={goalsInQuadrant('not-urgent-important')}
            allGoals={goals}
            onAssign={(goalId) => assignGoal(goalId, 'not-urgent-important')}
          />
        </div>

        {/* Строка 2: Не важно */}
        <div className="col-span-2 grid grid-cols-[auto_1fr_1fr] gap-3">
          <div className="w-24 flex items-center">
            <p className="text-xs font-semibold text-text-light uppercase tracking-wider
                         -rotate-90 whitespace-nowrap origin-center">
              Не важно
            </p>
          </div>

          {/* 🔵 Срочно + Не важно */}
          <QuadrantBox
            config={QUADRANTS[2]}
            goals={goalsInQuadrant('urgent-not-important')}
            allGoals={goals}
            onAssign={(goalId) => assignGoal(goalId, 'urgent-not-important')}
          />

          {/* ⚪ Не важно + Не срочно */}
          <QuadrantBox
            config={QUADRANTS[3]}
            goals={goalsInQuadrant('not-urgent-not-important')}
            allGoals={goals}
            onAssign={(goalId) => assignGoal(goalId, 'not-urgent-not-important')}
          />
        </div>
      </div>

      {/* Кнопка сохранения */}
      <div className="text-center mb-6">
        <button
          onClick={handleSave}
          disabled={Object.keys(assignments).length === 0}
          className={`px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer
            ${Object.keys(assignments).length > 0
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-border text-text-light cursor-not-allowed'
            }`}
        >
          {isSaved ? '💾 Обновить распределение' : '💾 Сохранить распределение'}
        </button>
      </div>

      {/* Подтверждение */}
      {isSaved && (
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 text-center">
          <p className="text-3xl mb-3">✅</p>
          <h3 className="text-lg font-bold text-text mb-2">
            Распределение сохранено
          </h3>
          <p className="text-sm text-text-light leading-relaxed max-w-md mx-auto">
            Сфокусируйтесь на квадранте «Важно и Срочно». 
            Запланируйте время для «Важно, но Не срочно» — 
            именно там находятся стратегические цели.
          </p>
        </div>
      )}
    </div>
  )
}

// =============================================
// Компонент одного квадранта
// =============================================
interface QuadrantBoxProps {
  config: typeof QUADRANTS[0]
  goals: Goal[]
  allGoals: Goal[]
  onAssign: (goalId: number) => void
}

function QuadrantBox({ config, goals, allGoals, onAssign }: QuadrantBoxProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl p-3 min-h-[140px]
                     flex flex-col`}>
      {/* Заголовок квадранта */}
      <div className="mb-2">
        <h4 className={`text-sm font-semibold ${config.color}`}>
          {config.emoji} {config.title}
        </h4>
        <p className="text-xs text-text-light">{config.subtitle}</p>
      </div>

      {/* Цели в квадранте */}
      <div className="flex-1 space-y-1.5 mb-2">
        {goals.map(goal => (
          <div
            key={goal.id}
            className="flex items-center justify-between bg-surface rounded-lg
                       px-2.5 py-1.5 text-sm border border-border"
          >
            <span className="text-text truncate mr-2">{goal.title}</span>
            <button
              onClick={() => onAssign(goal.id!)}
              className="text-text-light hover:text-danger text-xs cursor-pointer
                         transition-colors shrink-0"
              title="Убрать из квадранта"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Кнопка добавить цель */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-xs text-primary hover:text-primary-dark
                     cursor-pointer transition-colors"
        >
          + Добавить цель
        </button>

        {/* Выпадающий список целей */}
        {showDropdown && (
          <div className="absolute bottom-6 left-0 z-10 bg-surface border border-border
                         rounded-lg shadow-lg p-1 min-w-[200px]">
            {allGoals
              .filter(g => !goals.find(gg => gg.id === g.id))
              .map(goal => (
                <button
                  key={goal.id}
                  onClick={() => {
                    onAssign(goal.id!)
                    setShowDropdown(false)
                  }}
                  className="block w-full text-left px-3 py-1.5 text-sm text-text
                           hover:bg-bg rounded transition-colors cursor-pointer"
                >
                  {goal.title}
                  <span className="text-xs text-text-light ml-1">({goal.sphere})</span>
                </button>
              ))
            }
            {allGoals.filter(g => !goals.find(gg => gg.id === g.id)).length === 0 && (
              <p className="px-3 py-1.5 text-xs text-text-light">Все цели распределены</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}