import { useState, useEffect } from 'react'
import type { PpSmart } from '../types'

// Описания полей PP SMART — авторская методология
const FIELDS = [
  {
    key: 'positive',
    letter: 'P',
    title: 'Positive — Позитивный',
    hint: 'Сформулируй цель в прошедшем времени, как уже достигнутый факт.',
    placeholder: 'Я написал и запустил пилот электронного дневника #тыжменеджер',
    emoji: '✨',
  },
  {
    key: 'personal',
    letter: 'P',
    title: 'Proactive — Проактивность',
    hint: 'Личная ответственность за результат. Что именно ТЫ делаешь? Это в твоём круге влияния.',
    placeholder: 'Я лично разрабатываю структуру, тестирую, собираю обратную связь',
    emoji: '💪',
  },
  {
    key: 'specific',
    letter: 'S',
    title: 'Specific — Конкретная',
    hint: 'Что именно? Максимально конкретно опиши результат.',
    placeholder: 'PWA-приложение с ежедневником, целями, PP SMART, экшен-каскадом',
    emoji: '🎯',
  },
  {
    key: 'measurable',
    letter: 'M',
    title: 'Measurable — Измеримая',
    hint: 'Сколько? По какому показателю ты поймёшь, что цель достигнута?',
    placeholder: '10 тестовых пользователей дали обратную связь, 80% функций работают',
    emoji: '📊',
  },
  {
    key: 'achievable',
    letter: 'A',
    title: 'Achievable — Достижимая',
    hint: 'Как? Какие ресурсы и шаги нужны? Это реалистично?',
    placeholder: 'Использую ИИ как помощника, поэтапная разработка по плану из 14 шагов',
    emoji: '🛠️',
  },
  {
    key: 'relevant',
    letter: 'R',
    title: 'Relevant — Релевантная',
    hint: 'Зачем? Как эта цель связана с твоей стратегией и ценностями?',
    placeholder: 'Развитие личного бренда тренера, помощь людям в достижении целей',
    emoji: '🧭',
  },
  {
    key: 'timeBound',
    letter: 'T',
    title: 'Time-bound — Ограниченная по времени',
    hint: 'Когда? Конкретный дедлайн.',
    placeholder: 'До 31 августа 2026 года',
    emoji: '⏰',
  },
]

interface PpSmartFormProps {
  editingPpSmart?: PpSmart | null
  goalTitle: string
  onSave: (data: {
    positive: string
    personal: string
    specific: string
    measurable: string
    achievable: string
    relevant: string
    timeBound: string
  }) => void
  onCancel: () => void
}

export default function PpSmartForm({
  editingPpSmart,
  goalTitle,
  onSave,
  onCancel,
}: PpSmartFormProps) {
  const [values, setValues] = useState({
    positive: '',
    personal: '',
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: '',
  })

  // Заполнить при редактировании
  useEffect(() => {
    if (editingPpSmart) {
      setValues({
        positive: editingPpSmart.positive,
        personal: editingPpSmart.personal,
        specific: editingPpSmart.specific,
        measurable: editingPpSmart.measurable,
        achievable: editingPpSmart.achievable,
        relevant: editingPpSmart.relevant,
        timeBound: editingPpSmart.timeBound,
      })
    }
  }, [editingPpSmart])

  // Обновить значение поля
  function updateField(key: string, value: string) {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  // Считаем заполненность
  const filledCount = Object.values(values).filter(v => v.trim() !== '').length
  const totalCount = FIELDS.length
  const progressPercent = Math.round((filledCount / totalCount) * 100)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(values)
  }

  return (
    <div className="bg-surface border-2 border-primary/20 rounded-xl p-5">
      {/* Заголовок */}
      <div className="mb-4">
        <h3 className="font-semibold text-text text-lg">
          {editingPpSmart ? '✏️ Редактировать PP SMART' : '➕ Новый PP SMART'}
        </h3>
        <p className="text-sm text-text-light mt-1">
          Для цели: <span className="font-medium text-text">«{goalTitle}»</span>
        </p>
      </div>

      {/* Прогресс заполнения */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-light">Заполнено</span>
          <span className="text-xs font-bold text-text">
            {filledCount}/{totalCount}
          </span>
        </div>
        <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progressPercent === 100 ? 'bg-success' : 'bg-primary'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Поля формы */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(field => (
          <div key={field.key} className="bg-bg rounded-lg p-3">
            {/* Заголовок поля */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{field.emoji}</span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {field.letter}
              </span>
              <span className="text-sm font-semibold text-text">
                {field.title}
              </span>
            </div>

            {/* Подсказка */}
            <p className="text-xs text-text-light mb-2 ml-8">
              {field.hint}
            </p>

            {/* Поле ввода */}
            <textarea
              value={values[field.key as keyof typeof values]}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border
                         bg-surface text-text placeholder-text-light/40 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30
                         focus:border-primary transition-colors resize-none"
            />
          </div>
        ))}

        {/* Кнопки */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-primary text-white rounded-lg
                       hover:bg-primary-dark transition-colors cursor-pointer
                       font-medium"
          >
            {editingPpSmart ? 'Сохранить' : 'Создать PP SMART'}
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