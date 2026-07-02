import { useState, useEffect } from 'react'
import type { Goal, Strategy } from '../types'

const SPHERES = [
  'Здоровье', 'Карьера', 'Финансы', 'Отношения',
  'Семья', 'Развитие', 'Хобби', 'Духовность',
]

interface GoalFormProps {
  editingGoal?: Goal | null
  strategies: Strategy[]
  currentYear: number
  onSave: (data: {
    title: string
    description: string
    sphere: string
    year: number
    strategyId?: number
  }) => void
  onCancel: () => void
}

export default function GoalForm({
  editingGoal,
  strategies,
  currentYear,
  onSave,
  onCancel,
}: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sphere, setSphere] = useState(SPHERES[0])
  const [year, setYear] = useState(currentYear)
  const [strategyId, setStrategyId] = useState<number | undefined>(undefined)

  // Заполнить форму при редактировании
  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title)
      setDescription(editingGoal.description)
      setSphere(editingGoal.sphere)
      setYear(editingGoal.year)
      setStrategyId(editingGoal.strategyId)
    } else {
      setTitle('')
      setDescription('')
      setSphere(SPHERES[0])
      setYear(currentYear)
      setStrategyId(undefined)
    }
  }, [editingGoal, currentYear])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      sphere,
      year,
      strategyId,
    })
  }

  return (
    <div className="bg-surface border-2 border-primary/20 rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-text mb-4">
        {editingGoal ? '✏️ Редактировать цель' : '➕ Новая цель на год'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Название */}
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            Название цели
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Пробежать марафон"
            className="w-full px-3 py-2 rounded-lg border border-border
                       bg-bg text-text placeholder-text-light/50
                       focus:outline-none focus:ring-2 focus:ring-primary/30
                       focus:border-primary transition-colors"
            autoFocus
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            Описание (необязательно)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробнее о цели..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-border
                       bg-bg text-text placeholder-text-light/50
                       focus:outline-none focus:ring-2 focus:ring-primary/30
                       focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Сфера и Год */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-light mb-1">
              Сфера жизни
            </label>
            <select
              value={sphere}
              onChange={(e) => setSphere(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border
                         bg-bg text-text focus:outline-none focus:ring-2
                         focus:ring-primary/30 focus:border-primary transition-colors"
            >
              {SPHERES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="w-28">
            <label className="block text-sm font-medium text-text-light mb-1">
              Год
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-border
                         bg-bg text-text focus:outline-none focus:ring-2
                         focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Связь со стратегией */}
        {strategies.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-light mb-1">
              🔗 Привязать к стратегии (необязательно)
            </label>
            <select
              value={strategyId ?? ''}
              onChange={(e) => setStrategyId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-lg border border-border
                         bg-bg text-text focus:outline-none focus:ring-2
                         focus:ring-primary/30 focus:border-primary transition-colors"
            >
              <option value="">— Без привязки —</option>
              {strategies.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.sphere})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg
                       hover:bg-primary-dark transition-colors cursor-pointer font-medium"
          >
            {editingGoal ? 'Сохранить' : 'Добавить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-bg text-text-light rounded-lg
                       hover:bg-border transition-colors cursor-pointer"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}