import { useState, useEffect } from 'react'
import type { Strategy } from '../types'

const SPHERES = [
  'Здоровье', 'Карьера', 'Финансы', 'Отношения',
  'Семья', 'Развитие', 'Хобби', 'Духовность',
]

interface StrategyFormProps {
  editingStrategy?: Strategy | null
  onSave: (data: { title: string; description: string; sphere: string; deadline: string }) => void
  onCancel: () => void
}

export default function StrategyForm({ editingStrategy, onSave, onCancel }: StrategyFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sphere, setSphere] = useState(SPHERES[0])
  const [deadline, setDeadline] = useState('2030')

  // Заполнить форму при редактировании
  useEffect(() => {
    if (editingStrategy) {
      setTitle(editingStrategy.title)
      setDescription(editingStrategy.description)
      setSphere(editingStrategy.sphere)
      setDeadline(editingStrategy.deadline)
    } else {
      setTitle('')
      setDescription('')
      setSphere(SPHERES[0])
      setDeadline('2030')
    }
  }, [editingStrategy])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), description: description.trim(), sphere, deadline })
  }

  return (
    <div className="bg-surface border-2 border-primary/20 rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-text mb-4">
        {editingStrategy ? '✏️ Редактировать стратегию' : '➕ Новая стратегия'}
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
            placeholder="Например: Стать экспертом в управлении"
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

        {/* Сфера и Срок — в одну строку */}
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

          <div className="w-32">
            <label className="block text-sm font-medium text-text-light mb-1">
              Горизонт
            </label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="2030"
              className="w-full px-3 py-2 rounded-lg border border-border
                         bg-bg text-text focus:outline-none focus:ring-2
                         focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg
                       hover:bg-primary-dark transition-colors cursor-pointer font-medium"
          >
            {editingStrategy ? 'Сохранить' : 'Добавить'}
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