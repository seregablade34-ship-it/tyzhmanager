import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { Goal, ActionStep } from '../types'
import ActionStepItem from '../components/ActionStepItem'

export default function ActionCascadePage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Форма добавления/редактирования
  const [showForm, setShowForm] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDeadline, setFormDeadline] = useState('')
  const [formParentId, setFormParentId] = useState<number | undefined>(undefined)
  const [formLevel, setFormLevel] = useState(0)
  const [editingStep, setEditingStep] = useState<ActionStep | null>(null)

  // Загрузка
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [goalsData, stepsData] = await Promise.all([
        db.goals.orderBy('order').toArray(),
        db.actionSteps.orderBy('order').toArray(),
      ])
      setGoals(goalsData)
      setSteps(stepsData)

      if (!selectedGoalId && goalsData.length > 0) {
        setSelectedGoalId(goalsData[0].id!)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Шаги для выбранной цели
  const goalSteps = steps.filter(s => s.goalId === selectedGoalId)

  // Корневые шаги (без родителя)
  const rootSteps = goalSteps.filter(s => !s.parentId)

  // Статистика
  const totalSteps = goalSteps.length
  const completedSteps = goalSteps.filter(s => s.isCompleted).length
  const overallProgress = totalSteps > 0
    ? Math.round((completedSteps / totalSteps) * 100)
    : 0

  // Сколько целей имеют шаги
  const goalsWithSteps = new Set(steps.map(s => s.goalId))

  // Выбранная цель
  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null

  // Открыть форму для добавления
  function handleAdd(parentId?: number, level: number = 0) {
    setEditingStep(null)
    setFormTitle('')
    setFormDeadline('')
    setFormParentId(parentId)
    setFormLevel(level)
    setShowForm(true)
  }

  // Открыть форму для редактирования
  function handleEdit(step: ActionStep) {
    setEditingStep(step)
    setFormTitle(step.title)
    setFormDeadline(step.deadline || '')
    setFormParentId(step.parentId)
    setFormLevel(step.level)
    setShowForm(true)
  }

  // Сохранить
  async function handleSave() {
    if (!formTitle.trim() || !selectedGoalId) return

    try {
      const now = new Date().toISOString()

      if (editingStep) {
        await db.actionSteps.update(editingStep.id!, {
          title: formTitle.trim(),
          deadline: formDeadline || undefined,
          updatedAt: now,
        })
      } else {
        // Считаем порядок среди братьев
        const siblings = goalSteps.filter(s =>
          formParentId ? s.parentId === formParentId : !s.parentId
        )

        await db.actionSteps.add({
          goalId: selectedGoalId,
          parentId: formParentId,
          title: formTitle.trim(),
          isCompleted: false,
          deadline: formDeadline || undefined,
          order: siblings.length,
          level: formLevel,
          createdAt: now,
          updatedAt: now,
        })
      }

      await loadData()
      setShowForm(false)
      setEditingStep(null)
      setFormTitle('')
      setFormDeadline('')
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  // Переключить статус
  async function handleToggle(id: number, isCompleted: boolean) {
    try {
      const now = new Date().toISOString()
      await db.actionSteps.update(id, { isCompleted, updatedAt: now })
      await loadData()
    } catch (error) {
      console.error('Ошибка:', error)
    }
  }

  // Удалить (с дочерними)
  async function handleDelete(id: number) {
    const confirmed = window.confirm('Удалить этот шаг и все подзадачи?')
    if (!confirmed) return

    try {
      // Собираем все дочерние рекурсивно
      const toDelete: number[] = [id]
      function collectChildren(parentId: number) {
        const children = steps.filter(s => s.parentId === parentId)
        children.forEach(child => {
          toDelete.push(child.id!)
          collectChildren(child.id!)
        })
      }
      collectChildren(id)

      // Удаляем все
      await db.actionSteps.bulkDelete(toDelete)
      await loadData()
    } catch (error) {
      console.error('Ошибка удаления:', error)
    }
  }

  // Отмена формы
  function handleCancel() {
    setShowForm(false)
    setEditingStep(null)
    setFormTitle('')
    setFormDeadline('')
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  // Если нет целей
  if (goals.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-4">🔗 Экшен-каскадирование</h1>
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

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">🔗 Экшен-каскадирование</h1>
        <p className="text-sm text-text-light mt-1">
          Разбейте цель на конкретные шаги — от крупных к мелким
        </p>
      </div>

      {/* Выбор цели */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <label className="block text-sm font-medium text-text-light mb-2">
          Выберите цель:
        </label>
        <div className="grid gap-2">
          {goals.map(goal => {
            const hasSteps = goalsWithSteps.has(goal.id!)
            const isSelected = selectedGoalId === goal.id
            const goalStepCount = steps.filter(s => s.goalId === goal.id).length

            return (
              <button
                key={goal.id}
                onClick={() => {
                  setSelectedGoalId(goal.id!)
                  setShowForm(false)
                  setEditingStep(null)
                }}
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
                {hasSteps ? (
                  <span className="text-xs text-success font-medium">
                    {goalStepCount} шагов
                  </span>
                ) : (
                  <span className="text-xs text-text-light">—</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Контент для выбранной цели */}
      {selectedGoal && (
        <>
          {/* Статистика + кнопка добавить */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {totalSteps > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300
                                   ${overallProgress === 100 ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-text">
                      {overallProgress}%
                    </span>
                  </div>
                  <span className="text-xs text-text-light">
                    {completedSteps}/{totalSteps} шагов
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => handleAdd(undefined, 0)}
              className="px-4 py-2 bg-primary text-white rounded-lg
                         hover:bg-primary-dark transition-colors cursor-pointer
                         font-medium text-sm flex items-center gap-1"
            >
              <span>+</span>
              <span>Добавить шаг</span>
            </button>
          </div>

          {/* Форма (если открыта) */}
          {showForm && (
            <div className="bg-surface border-2 border-primary/20 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-text mb-3 text-sm">
                {editingStep ? '✏️ Редактировать шаг' : `➕ Новый шаг (уровень ${formLevel})`}
                {formParentId && (
                  <span className="text-text-light font-normal">
                    {' '}— подзадача
                  </span>
                )}
              </h3>

              <div className="space-y-3">
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Название шага..."
                  className="w-full px-3 py-2 rounded-lg border border-border
                             bg-bg text-text placeholder-text-light/50
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition-colors"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave()
                    if (e.key === 'Escape') handleCancel()
                  }}
                />

                <input
                  type="text"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  placeholder="Дедлайн (необязательно), например: до 15 июля"
                  className="w-full px-3 py-2 rounded-lg border border-border
                             bg-bg text-text placeholder-text-light/50
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition-colors"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-white rounded-lg
                               hover:bg-primary-dark transition-colors cursor-pointer
                               font-medium text-sm"
                  >
                    {editingStep ? 'Сохранить' : 'Добавить'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-bg text-text-light rounded-lg
                               hover:bg-border transition-colors cursor-pointer text-sm"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Дерево шагов */}
          {rootSteps.length > 0 ? (
            <div>
              {rootSteps.map(step => {
                const children = goalSteps.filter(s => s.parentId === step.id)
                return (
                  <ActionStepItem
                    key={step.id}
                    step={step}
                    children={children}
                    allSteps={goalSteps}
                    onToggle={handleToggle}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                )
              })}
            </div>
          ) : !showForm ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🔗</p>
              <h3 className="text-lg font-semibold text-text mb-2">
                Каскад пока пуст
              </h3>
              <p className="text-text-light mb-6">
                Разбейте цель «{selectedGoal.title}» на конкретные шаги
              </p>
              <button
                onClick={() => handleAdd(undefined, 0)}
                className="px-6 py-3 bg-primary text-white rounded-lg
                           hover:bg-primary-dark transition-colors cursor-pointer
                           font-medium"
              >
                ➕ Добавить первый шаг
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}