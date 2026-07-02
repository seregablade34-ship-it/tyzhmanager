import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { Strategy } from '../types'
import StrategyCard from '../components/StrategyCard'
import StrategyForm from '../components/StrategyForm'

export default function StrategyPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Загрузка из БД
  useEffect(() => {
    loadStrategies()
  }, [])

  async function loadStrategies() {
    try {
      const data = await db.strategies.orderBy('order').toArray()
      setStrategies(data)
    } catch (error) {
      console.error('Ошибка загрузки стратегий:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Добавить / обновить
  async function handleSave(data: {
    title: string
    description: string
    sphere: string
    deadline: string
  }) {
    try {
      const now = new Date().toISOString()

      if (editingStrategy) {
        // Обновляем
        await db.strategies.update(editingStrategy.id!, {
          ...data,
          updatedAt: now,
        })
      } else {
        // Добавляем новую
        await db.strategies.add({
          ...data,
          order: strategies.length,
          createdAt: now,
          updatedAt: now,
        })
      }

      await loadStrategies()
      setShowForm(false)
      setEditingStrategy(null)
    } catch (error) {
      console.error('Ошибка сохранения стратегии:', error)
    }
  }

  // Редактировать
  function handleEdit(strategy: Strategy) {
    setEditingStrategy(strategy)
    setShowForm(true)
  }

  // Удалить
  async function handleDelete(id: number) {
    const confirmed = window.confirm('Удалить эту стратегию?')
    if (!confirmed) return

    try {
      await db.strategies.delete(id)
      await loadStrategies()
    } catch (error) {
      console.error('Ошибка удаления стратегии:', error)
    }
  }

  // Отмена формы
  function handleCancel() {
    setShowForm(false)
    setEditingStrategy(null)
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
          <h1 className="text-2xl font-bold text-text">🎯 Стратегия 5 лет</h1>
          <p className="text-sm text-text-light mt-1">
            Большие цели по сферам жизни
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setEditingStrategy(null)
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

      {/* Форма (если открыта) */}
      {showForm && (
        <StrategyForm
          editingStrategy={editingStrategy}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Список стратегий */}
      {strategies.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🎯</p>
          <h3 className="text-lg font-semibold text-text mb-2">
            Пока нет стратегий
          </h3>
          <p className="text-text-light mb-6">
            Добавьте свою первую стратегическую цель на 5 лет
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg
                       hover:bg-primary-dark transition-colors cursor-pointer
                       font-medium"
          >
            ➕ Добавить первую стратегию
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {strategies.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Счётчик */}
      {strategies.length > 0 && (
        <div className="mt-6 text-center text-sm text-text-light">
          Всего стратегий: {strategies.length}
        </div>
      )}
    </div>
  )
}