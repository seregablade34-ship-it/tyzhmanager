import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { Goal, Strategy } from '../types'
import GoalCard from '../components/GoalCard'
import GoalForm from '../components/GoalForm'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  // Загрузка из БД
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [goalsData, strategiesData] = await Promise.all([
        db.goals.orderBy('order').toArray(),
        db.strategies.orderBy('order').toArray(),
      ])
      setGoals(goalsData)
      setStrategies(strategiesData)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Фильтруем по году
  const filteredGoals = goals.filter(g => g.year === filterYear)

  // Статистика
  const activeCount = filteredGoals.filter(g => g.status === 'active').length
  const completedCount = filteredGoals.filter(g => g.status === 'completed').length
  const avgProgress = filteredGoals.length > 0
    ? Math.round(filteredGoals.reduce((sum, g) => sum + g.progress, 0) / filteredGoals.length)
    : 0

  // Получить название стратегии по id
  function getStrategyTitle(strategyId?: number): string | undefined {
    if (!strategyId) return undefined
    return strategies.find(s => s.id === strategyId)?.title
  }

  // Добавить / обновить
  async function handleSave(data: {
    title: string
    description: string
    sphere: string
    year: number
    strategyId?: number
  }) {
    try {
      const now = new Date().toISOString()

      if (editingGoal) {
        await db.goals.update(editingGoal.id!, {
          ...data,
          updatedAt: now,
        })
      } else {
        await db.goals.add({
          ...data,
          status: 'active',
          progress: 0,
          order: goals.length,
          createdAt: now,
          updatedAt: now,
        })
      }

      await loadData()
      setShowForm(false)
      setEditingGoal(null)
    } catch (error) {
      console.error('Ошибка сохранения цели:', error)
    }
  }

  // Редактировать
  function handleEdit(goal: Goal) {
    setEditingGoal(goal)
    setShowForm(true)
  }

  // Удалить
  async function handleDelete(id: number) {
    const confirmed = window.confirm('Удалить эту цель?')
    if (!confirmed) return

    try {
      await db.goals.delete(id)
      await loadData()
    } catch (error) {
      console.error('Ошибка удаления цели:', error)
    }
  }

  // Изменить прогресс
  async function handleProgressChange(id: number, progress: number) {
    try {
      const now = new Date().toISOString()
      const updates: Partial<Goal> = {
        progress,
        updatedAt: now,
      }

      // Автоматически менять статус при 100%
      if (progress === 100) {
        updates.status = 'completed'
      } else {
        updates.status = 'active'
      }

      await db.goals.update(id, updates)
      await loadData()
    } catch (error) {
      console.error('Ошибка обновления прогресса:', error)
    }
  }

  // Отмена формы
  function handleCancel() {
    setShowForm(false)
    setEditingGoal(null)
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">📋 Цели на год</h1>
          <p className="text-sm text-text-light mt-1">
            Конкретные цели с измеримым результатом
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setEditingGoal(null)
              setShowForm(true)
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg
                       hover:bg-primary-dark transition-colors cursor-pointer
                       font-medium flex items-center gap-2"
          >
            <span>+</span>
            <span>Добавить</span>
          </button>
        )}
      </div>

      {/* Фильтр по годам */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilterYear(y => y - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     bg-bg text-text-light hover:text-text hover:bg-border
                     transition-colors cursor-pointer"
        >
          ◀
        </button>
        <span className="text-lg font-bold text-text px-3">
          {filterYear}
        </span>
        <button
          onClick={() => setFilterYear(y => y + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     bg-bg text-text-light hover:text-text hover:bg-border
                     transition-colors cursor-pointer"
        >
          ▶
        </button>

        {filterYear !== new Date().getFullYear() && (
          <button
            onClick={() => setFilterYear(new Date().getFullYear())}
            className="text-sm text-primary hover:text-primary-dark
                       transition-colors cursor-pointer ml-2"
          >
            ↩ Текущий год
          </button>
        )}
      </div>

      {/* Мини-статистика */}
      {filteredGoals.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{activeCount}</p>
            <p className="text-xs text-text-light">В работе</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-success">{completedCount}</p>
            <p className="text-xs text-text-light">Достигнуто</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-warning">{avgProgress}%</p>
            <p className="text-xs text-text-light">Ср. прогресс</p>
          </div>
        </div>
      )}

      {/* Форма (если открыта) */}
      {showForm && (
        <GoalForm
          editingGoal={editingGoal}
          strategies={strategies}
          currentYear={filterYear}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Список целей */}
      {filteredGoals.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-lg font-semibold text-text mb-2">
            Нет целей на {filterYear} год
          </h3>
          <p className="text-text-light mb-6">
            Добавьте первую цель!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg
                       hover:bg-primary-dark transition-colors cursor-pointer
                       font-medium"
          >
            ➕ Добавить первую цель
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              strategyTitle={getStrategyTitle(goal.strategyId)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onProgressChange={handleProgressChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}