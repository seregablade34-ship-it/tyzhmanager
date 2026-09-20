import { useState, useEffect } from 'react'
import { goalsTable, reflectionsTable } from '../api/helpers'
import type { Goal, MonthProgress } from '../types'
import GoalCard from '../components/GoalCard'
import GoalForm from '../components/GoalForm'
import ReflectionModal from '../components/ReflectionModal'
import { fireGoalConfetti } from '../hooks/useConfetti'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Фильтр по сфере
  const [filterSphere, setFilterSphere] = useState<string>('all')

  // Рефлексия
  const [reflectionGoal, setReflectionGoal] = useState<Goal | null>(null)
  const [reflectionType, setReflectionType] = useState<'completed' | 'failed'>('completed')

  // Загрузка из БД
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const goalsData = await goalsTable.getAll('order')
      setGoals(goalsData)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Уникальные сферы для фильтра
  const spheres = [...new Set(goals.map(g => g.sphere))]

  // Фильтруем по сфере
  const filteredGoals = filterSphere === 'all'
    ? goals
    : goals.filter(g => g.sphere === filterSphere)

  // Сортировка: активные сверху, потом выполненные, потом отменённые
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    const order = { active: 0, completed: 1, cancelled: 2 }
    const diff = order[a.status] - order[b.status]
    if (diff !== 0) return diff
    return a.order - b.order
  })

  // Статистика
  const activeCount = filteredGoals.filter(g => g.status === 'active').length
  const completedCount = filteredGoals.filter(g => g.status === 'completed').length
  const cancelledCount = filteredGoals.filter(g => g.status === 'cancelled').length
  const avgProgress = filteredGoals.length > 0
    ? Math.round(filteredGoals.reduce((sum, g) => sum + g.progress, 0) / filteredGoals.length)
    : 0

  // Добавить / обновить
  async function handleSave(data: {
    title: string
    description: string
    sphere: string
    deadline: string
  }) {
    try {
      const now = new Date().toISOString()

      if (editingGoal) {
        await goalsTable.update(editingGoal.id!, {
          ...data,
          updatedAt: now,
        })
      } else {
        await goalsTable.create({
          ...data,
          status: 'active',
          progress: 0,
          priority: 'medium',
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
      await goalsTable.remove(id)
      // Удаляем связанную рефлексию
      const refs = await reflectionsTable.getWhere('goalId', id)
      for (const ref of refs) {
        if (ref.id) await reflectionsTable.remove(ref.id)
      }
      await loadData()
    } catch (error) {
      console.error('Ошибка удаления цели:', error)
    }
  }

  // Изменить прогресс
  async function handleProgressChange(id: number, progress: number) {
    try {
      const now = new Date().toISOString()
      await goalsTable.update(id, {
        progress,
        updatedAt: now,
      })
      await loadData()
    } catch (error) {
      console.error('Ошибка обновления прогресса:', error)
    }
  }

  // Изменить трекер по месяцам
  async function handleMonthlyChange(id: number, monthly: MonthProgress[]) {
    try {
      const now = new Date().toISOString()
      await goalsTable.update(id, {
        monthlyProgress: monthly,
        updatedAt: now,
      })
      await loadData()
    } catch (error) {
      console.error('Ошибка обновления месяцев:', error)
    }
  }

  // ===== ВЫПОЛНЕНО — открыть рефлексию =====
  function handleComplete(goal: Goal) {
    setReflectionGoal(goal)
    setReflectionType('completed')
  }

  // ===== НЕ ВЫПОЛНЕНО — открыть рефлексию =====
  function handleFail(goal: Goal) {
    setReflectionGoal(goal)
    setReflectionType('failed')
  }

  // ===== Сохранение рефлексии =====
  async function handleReflectionSave() {
    if (!reflectionGoal) return

    try {
      const now = new Date().toISOString()

      if (reflectionType === 'completed') {
        await goalsTable.update(reflectionGoal.id!, {
          status: 'completed',
          progress: 100,
          updatedAt: now,
        })
        // 🎊 Конфетти!
        fireGoalConfetti()
      } else {
        await goalsTable.update(reflectionGoal.id!, {
          status: 'cancelled',
          updatedAt: now,
        })
      }

      await loadData()
    } catch (error) {
      console.error('Ошибка обновления статуса цели:', error)
    } finally {
      setReflectionGoal(null)
    }
  }

  // Отмена рефлексии
  function handleReflectionCancel() {
    setReflectionGoal(null)
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
          <h1 className="text-2xl font-bold text-text">🎯 Мои цели</h1>
          <p className="text-sm text-text-light mt-1">
            Все цели — от недельных до стратегических
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

      {/* Фильтр по сферам */}
      {spheres.length > 1 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterSphere('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
              ${filterSphere === 'all'
                ? 'bg-primary text-white'
                : 'bg-bg text-text-light hover:bg-border'
              }`}
          >
            Все ({goals.length})
          </button>
          {spheres.map(s => (
            <button
              key={s}
              onClick={() => setFilterSphere(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                ${filterSphere === s
                  ? 'bg-primary text-white'
                  : 'bg-bg text-text-light hover:bg-border'
                }`}
            >
              {s} ({goals.filter(g => g.sphere === s).length})
            </button>
          ))}
        </div>
      )}

      {/* Мини-статистика */}
      {filteredGoals.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{activeCount}</p>
            <p className="text-xs text-text-light">В работе</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-success">{completedCount}</p>
            <p className="text-xs text-text-light">Достигнуто</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-danger">{cancelledCount}</p>
            <p className="text-xs text-text-light">Не выполнено</p>
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
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Список целей */}
      {sortedGoals.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🎯</p>
          <h3 className="text-lg font-semibold text-text mb-2">
            Пока нет целей
          </h3>
          <p className="text-text-light mb-6">
            Добавьте первую цель — любого масштаба!
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
          {sortedGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onProgressChange={handleProgressChange}
              onComplete={handleComplete}
              onFail={handleFail}
              onMonthlyChange={handleMonthlyChange}
            />
          ))}
        </div>
      )}

      {/* ===== МОДАЛКА РЕФЛЕКСИИ ===== */}
      {reflectionGoal && (
        <ReflectionModal
          goalId={reflectionGoal.id}
          title={reflectionGoal.title}
          type={reflectionType}
          onSave={handleReflectionSave}
          onCancel={handleReflectionCancel}
        />
      )}
    </div>
  )
}