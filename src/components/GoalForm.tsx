import { useState, useEffect } from 'react'
import type { Goal } from '../types'
import CalendarPopup from './CalendarPopup'
import { Calendar } from 'lucide-react'

const SPHERES = [
  'Здоровье', 'Карьера', 'Финансы', 'Отношения',
  'Семья', 'Развитие', 'Хобби', 'Духовность',
]

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface GoalFormProps {
  editingGoal?: Goal | null
  onSave: (data: {
    title: string
    description: string
    sphere: string
    deadline: string
  }) => void
  onCancel: () => void
}

export default function GoalForm({
  editingGoal,
  onSave,
  onCancel,
}: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sphere, setSphere] = useState(SPHERES[0])
  const [deadline, setDeadline] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title)
      setDescription(editingGoal.description)
      setSphere(editingGoal.sphere)
      setDeadline(editingGoal.deadline || '')
    } else {
      setTitle('')
      setDescription('')
      setSphere(SPHERES[0])
      setDeadline('')
    }
  }, [editingGoal])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      sphere,
      deadline: deadline || '',
    })
  }

  const calendarDefault = deadline || `${new Date().getFullYear()}-12-31`

  return (
    <div className="bg-surface border-2 border-primary/20 rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-text mb-4">
        {editingGoal ? '✏️ Редактировать цель' : '➕ Новая цель'}
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

        {/* Сфера */}
        <div>
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

        {/* Дедлайн */}
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">
            📅 Срок (любая дата)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="flex-1 px-3 py-2 rounded-lg border border-border
                         bg-bg text-text text-left flex items-center gap-2
                         hover:border-primary/50 hover:bg-primary/5
                         focus:outline-none focus:ring-2 focus:ring-primary/30
                         transition-colors cursor-pointer"
            >
              <Calendar size={16} className="text-primary shrink-0" />
              <span className="text-sm truncate">
                {deadline ? formatDate(deadline) : 'Выбрать дату...'}
              </span>
            </button>
            {deadline && (
              <button
                type="button"
                onClick={() => setDeadline('')}
                className="px-3 py-2 rounded-lg border border-border
                           bg-bg text-text-light hover:text-danger hover:border-danger/30
                           transition-colors cursor-pointer text-sm"
                title="Убрать дедлайн"
              >
                ✕
              </button>
            )}
          </div>
        </div>

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

      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        currentDate={calendarDefault}
        onSelectDate={(date) => setDeadline(date)}
      />
    </div>
  )
}