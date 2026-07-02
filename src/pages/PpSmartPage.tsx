import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { Goal, PpSmart } from '../types'
import PpSmartForm from '../components/PpSmartForm'

// Описания полей для отображения карточки
const FIELD_INFO = [
  { key: 'positive', letter: 'P', title: 'Positive — Позитивный', emoji: '✨' },
  { key: 'personal', letter: 'P', title: 'Proactive — Проактивность', emoji: '💪' },
  { key: 'specific', letter: 'S', title: 'Specific — Конкретная', emoji: '🎯' },
  { key: 'measurable', letter: 'M', title: 'Measurable — Измеримая', emoji: '📊' },
  { key: 'achievable', letter: 'A', title: 'Achievable — Достижимая', emoji: '🛠️' },
  { key: 'relevant', letter: 'R', title: 'Relevant — Релевантная', emoji: '🧭' },
  { key: 'timeBound', letter: 'T', title: 'Time-bound — Ограниченная по времени', emoji: '⏰' },
]

export default function PpSmartPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [ppSmarts, setPpSmarts] = useState<PpSmart[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPpSmart, setEditingPpSmart] = useState<PpSmart | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Загрузка данных
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [goalsData, ppSmartsData] = await Promise.all([
        db.goals.orderBy('order').toArray(),
        db.ppSmarts.toArray(),
      ])
      setGoals(goalsData)
      setPpSmarts(ppSmartsData)

      // Автоматически выбрать первую цель, если ничего не выбрано
      if (!selectedGoalId && goalsData.length > 0) {
        setSelectedGoalId(goalsData[0].id!)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // PP SMART для выбранной цели
  const currentPpSmart = ppSmarts.find(p => p.goalId === selectedGoalId) || null

  // Выбранная цель
  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null

  // Сколько целей имеют PP SMART
  const goalsWithPpSmart = new Set(ppSmarts.map(p => p.goalId))

  // Сохранить PP SMART
  async function handleSave(data: {
    positive: string
    personal: string
    specific: string
    measurable: string
    achievable: string
    relevant: string
    timeBound: string
  }) {
    if (!selectedGoalId) return

    try {
      const now = new Date().toISOString()

      if (editingPpSmart) {
        // Обновляем существующий
        await db.ppSmarts.update(editingPpSmart.id!, {
          ...data,
          updatedAt: now,
        })
      } else {
        // Создаём новый
        await db.ppSmarts.add({
          goalId: selectedGoalId,
          ...data,
          createdAt: now,
          updatedAt: now,
        })
      }

      await loadData()
      setShowForm(false)
      setEditingPpSmart(null)
    } catch (error) {
      console.error('Ошибка сохранения PP SMART:', error)
    }
  }

  // Редактировать
  function handleEdit() {
    if (currentPpSmart) {
      setEditingPpSmart(currentPpSmart)
      setShowForm(true)
    }
  }

  // Удалить
  async function handleDelete() {
    if (!currentPpSmart) return
    const confirmed = window.confirm('Удалить PP SMART для этой цели?')
    if (!confirmed) return

    try {
      await db.ppSmarts.delete(currentPpSmart.id!)
      await loadData()
    } catch (error) {
      console.error('Ошибка удаления PP SMART:', error)
    }
  }

  // Отмена
  function handleCancel() {
    setShowForm(false)
    setEditingPpSmart(null)
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  // Если нет целей — подсказка
  if (goals.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-4">🎯 PP SMART</h1>
        <div className="text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-lg font-semibold text-text mb-2">
            Сначала создайте цель
          </h3>
          <p className="text-text-light">
            PP SMART применяется к целям на год. Перейдите в раздел
            «Цели на год» и добавьте хотя бы одну цель.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">🎯 PP SMART</h1>
        <p className="text-sm text-text-light mt-1">
          Детализация целей по авторской методологии
        </p>
      </div>

      {/* Выбор цели */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <label className="block text-sm font-medium text-text-light mb-2">
          Выберите цель для PP SMART:
        </label>
        <div className="grid gap-2">
          {goals.map(goal => {
            const hasPpSmart = goalsWithPpSmart.has(goal.id!)
            const isSelected = selectedGoalId === goal.id

            return (
              <button
                key={goal.id}
                onClick={() => {
                  setSelectedGoalId(goal.id!)
                  setShowForm(false)
                  setEditingPpSmart(null)
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
                  <span className="text-sm font-medium">
                    {goal.title}
                  </span>
                  <span className="text-xs text-text-light bg-surface px-2 py-0.5 rounded-full">
                    {goal.sphere}
                  </span>
                </div>
                {hasPpSmart ? (
                  <span className="text-xs text-success font-medium">✅ Есть</span>
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
          {/* Если есть PP SMART — показываем карточку */}
          {currentPpSmart && !showForm && (
            <div className="bg-surface border border-border rounded-xl p-5">
              {/* Заголовок карточки */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text text-lg">
                  PP SMART: «{selectedGoal.title}»
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={handleEdit}
                    className="w-8 h-8 flex items-center justify-center rounded-lg
                               text-text-light hover:text-primary hover:bg-primary/10
                               transition-colors cursor-pointer text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-8 h-8 flex items-center justify-center rounded-lg
                               text-text-light hover:text-danger hover:bg-danger/10
                               transition-colors cursor-pointer text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Поля PP SMART */}
              <div className="space-y-3">
                {FIELD_INFO.map(field => {
                  const value = currentPpSmart[field.key as keyof PpSmart] as string
                  if (!value) return null

                  return (
                    <div key={field.key} className="bg-bg rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{field.emoji}</span>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {field.letter}
                        </span>
                        <span className="text-sm font-semibold text-text">
                          {field.title}
                        </span>
                      </div>
                      <p className="text-sm text-text ml-8 leading-relaxed">
                        {value}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Если нет PP SMART — кнопка создать */}
          {!currentPpSmart && !showForm && (
            <div className="text-center py-8">
              <p className="text-4xl mb-4">🎯</p>
              <h3 className="text-lg font-semibold text-text mb-2">
                PP SMART не создан
              </h3>
              <p className="text-text-light mb-6">
                Детализируйте цель «{selectedGoal.title}» по 7 критериям
              </p>
              <button
                onClick={() => {
                  setEditingPpSmart(null)
                  setShowForm(true)
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg
                           hover:bg-primary-dark transition-colors cursor-pointer
                           font-medium"
              >
                ➕ Создать PP SMART
              </button>
            </div>
          )}

          {/* Форма */}
          {showForm && (
            <PpSmartForm
              editingPpSmart={editingPpSmart}
              goalTitle={selectedGoal.title}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </>
      )}
    </div>
  )
}