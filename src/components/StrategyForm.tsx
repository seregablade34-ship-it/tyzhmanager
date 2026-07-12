import { useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'
import type { Strategy } from '../types'

const SPHERES = [
  'Здоровье', 'Карьера', 'Финансы', 'Отношения',
  'Семья', 'Развитие', 'Хобби', 'Духовность',
]

interface StrategyFormProps {
  editingStrategy?: Strategy | null
  onSave: (data: {
    title: string
    description: string
    sphere: string
    deadline: string
    yearGoals: string[]
  }) => void
  onCancel: () => void
}

export default function StrategyForm({ editingStrategy, onSave, onCancel }: StrategyFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sphere, setSphere] = useState(SPHERES[0])
  const [deadline, setDeadline] = useState('2030')
  const [yearGoals, setYearGoals] = useState<string[]>([])
  const [showYears, setShowYears] = useState(false)

  // Заполнить форму при редактировании
  useEffect(() => {
    if (editingStrategy) {
      setTitle(editingStrategy.title)
      setDescription(editingStrategy.description)
      setSphere(editingStrategy.sphere)
      setDeadline(editingStrategy.deadline)
      const goals = editingStrategy.yearGoals || []
      setYearGoals(goals)
      setShowYears(goals.filter(g => g.trim()).length > 0)
    } else {
      setTitle('')
      setDescription('')
      setSphere(SPHERES[0])
      setDeadline('2030')
      setYearGoals([])
      setShowYears(false)
    }
  }, [editingStrategy])

  // Стартовый год подцелей
    const currentYear = new Date().getFullYear()

  // Добавить год
  function addYear() {
    if (yearGoals.length >= 5) return
    setYearGoals(prev => [...prev, ''])
  }

  // Удалить последний год
  function removeYear() {
    if (yearGoals.length === 0) return
    setYearGoals(prev => prev.slice(0, -1))
  }

  // Обновить подцель
  function updateYearGoal(index: number, value: string) {
    setYearGoals(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  // Быстро добавить 5 лет
  function addAllYears() {
    const count = 5 - yearGoals.length
    if (count <= 0) return
    setYearGoals(prev => [...prev, ...Array(count).fill('')])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      sphere,
      deadline,
      yearGoals,
    })
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

        {/* ===== ПОДЦЕЛИ ПО ГОДАМ ===== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => {
                setShowYears(!showYears)
                if (!showYears && yearGoals.length === 0) {
                  addYear()
                }
              }}
              className="text-sm font-medium text-primary hover:text-primary/80
                         transition-colors cursor-pointer flex items-center gap-1.5"
            >
              📆 Подцели по годам
              <span className="text-xs text-text-light">
                ({yearGoals.filter(g => g.trim()).length} из {yearGoals.length})
              </span>
            </button>
          </div>

          {showYears && (
            <div className="bg-bg rounded-lg p-3 space-y-2">
              <p className="text-xs text-text-light mb-2">
                Разбейте стратегическую цель на конкретные шаги по годам
              </p>

              {yearGoals.map((goal, i) => {
                const year = currentYear + i
                const isCurrent = year === currentYear

                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${
                      isCurrent
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {year}
                    </span>
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => updateYearGoal(i, e.target.value)}
                      placeholder={`Цель на ${year} год...`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border
                                 bg-surface text-text text-sm placeholder-text-light/40
                                 focus:outline-none focus:ring-2 focus:ring-primary/30
                                 focus:border-primary transition-colors"
                    />
                  </div>
                )
              })}

              {/* Кнопки управления годами */}
              <div className="flex items-center gap-2 pt-1">
                {yearGoals.length < 5 && (
                  <button
                    type="button"
                    onClick={addYear}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80
                               transition-colors cursor-pointer px-2 py-1 rounded-lg
                               bg-primary/10 hover:bg-primary/20"
                  >
                    <Plus size={12} />
                    Добавить год
                  </button>
                )}
                {yearGoals.length > 0 && (
                  <button
                    type="button"
                    onClick={removeYear}
                    className="flex items-center gap-1 text-xs text-danger hover:text-danger/80
                               transition-colors cursor-pointer px-2 py-1 rounded-lg
                               bg-danger/10 hover:bg-danger/20"
                  >
                    <Minus size={12} />
                    Убрать
                  </button>
                )}
                {yearGoals.length < 5 && (
                  <button
                    type="button"
                    onClick={addAllYears}
                    className="flex items-center gap-1 text-xs text-text-light hover:text-text
                               transition-colors cursor-pointer px-2 py-1 rounded-lg
                               bg-bg hover:bg-border ml-auto"
                  >
                    Заполнить 5 лет
                  </button>
                )}
              </div>
            </div>
          )}
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