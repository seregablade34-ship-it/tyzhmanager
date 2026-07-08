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
    tip: '💡 Примеры:\n• «Я создал...»\n• «Я достиг...»\n• «Я заработал...»\n\nФормулируй так, будто это УЖЕ случилось. Мозг начинает искать пути к цели, когда она описана как факт.',
  },
  {
    key: 'personal',
    letter: 'P',
    title: 'Proactive — Проактивность',
    hint: 'Личная ответственность за результат. Что именно ТЫ делаешь? Это в твоём круге влияния.',
    placeholder: 'Я лично разрабатываю структуру, тестирую, собираю обратную связь',
    emoji: '💪',
    tip: '💡 Ключевой вопрос: это в моём круге влияния?\n\n✅ «Я изучаю, создаю, организую...»\n❌ «Начальник повысит меня...»\n\nПроактивность — это когда ТЫ действуешь, а не ждёшь, пока кто-то сделает за тебя.',
  },
  {
    key: 'specific',
    letter: 'S',
    title: 'Specific — Конкретная',
    hint: 'Что именно? Максимально конкретно опиши результат.',
    placeholder: 'PWA-приложение с ежедневником, целями, PP SMART, экшен-каскадом',
    emoji: '🎯',
    tip: '💡 Проверь конкретность:\n\n❌ «Стать лучше» — размыто\n✅ «Пробежать полумарафон 21.1 км» — конкретно\n\n❌ «Больше зарабатывать» — размыто\n✅ «Доход 200 000 ₽/мес от консалтинга» — конкретно',
  },
  {
    key: 'measurable',
    letter: 'M',
    title: 'Measurable — Измеримая',
    hint: 'Сколько? По какому показателю ты поймёшь, что цель достигнута?',
    placeholder: '10 тестовых пользователей дали обратную связь, 80% функций работают',
    emoji: '📊',
    tip: '💡 Вопросы для измеримости:\n\n• Сколько? (число, %, сумма)\n• Как я узнаю, что достиг?\n• Какой конкретный результат?\n\nПримеры: «10 клиентов», «80% готовности», «3 статьи», «50 000 ₽ дохода».',
  },
  {
    key: 'achievable',
    letter: 'A',
    title: 'Achievable — Достижимая',
    hint: 'Как? Какие ресурсы и шаги нужны? Это реалистично?',
    placeholder: 'Использую ИИ как помощника, поэтапная разработка по плану из 14 шагов',
    emoji: '🛠️',
    tip: '💡 Проверь достижимость:\n\n• Какие ресурсы есть? (время, деньги, навыки)\n• Какие ресурсы нужно найти?\n• Есть ли примеры, что другие это сделали?\n\nЦель должна быть вызовом, но НЕ фантастикой.',
  },
  {
    key: 'relevant',
    letter: 'R',
    title: 'Relevant — Релевантная',
    hint: 'Зачем? Как эта цель связана с твоей стратегией и ценностями?',
    placeholder: 'Развитие личного бренда тренера, помощь людям в достижении целей',
    emoji: '🧭',
    tip: '💡 Вопросы для релевантности:\n\n• Зачем мне это?\n• Как это связано с моими ценностями?\n• Это приближает к стратегической цели?\n• Буду ли я жалеть, если НЕ сделаю?\n\nЦель без «зачем» — просто задача.',
  },
  {
    key: 'timeBound',
    letter: 'T',
    title: 'Time-bound — Ограниченная по времени',
    hint: 'Когда? Конкретный дедлайн.',
    placeholder: 'До 31 августа 2026 года',
    emoji: '⏰',
    tip: '💡 Правила дедлайна:\n\n✅ «До 31 августа 2026» — конкретно\n❌ «Когда-нибудь» — не работает\n\nДедлайн создаёт urgency. Без него цель превращается в мечту.',
    isDate: true,
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

  // Какой tooltip открыт
  const [openTip, setOpenTip] = useState<string | null>(null)

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

  // Форматирование даты из input[type=date] → "31 августа 2026"
  function formatDateRussian(dateStr: string): string {
    if (!dateStr) return ''
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ]
    const [year, month, day] = dateStr.split('-')
    if (!year || !month || !day) return dateStr
    const monthIdx = parseInt(month, 10) - 1
    return `${parseInt(day, 10)} ${months[monthIdx]} ${year}`
  }

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
        {goalTitle && (
          <p className="text-sm text-text-light mt-1">
            Для цели: <span className="font-medium text-text">«{goalTitle}»</span>
          </p>
        )}
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
              {/* Кнопка подсказки */}
              <button
                type="button"
                onClick={() => setOpenTip(openTip === field.key ? null : field.key)}
                className={`w-5 h-5 flex items-center justify-center rounded-full text-xs
                           cursor-pointer transition-colors
                           ${openTip === field.key
                             ? 'bg-primary text-white'
                             : 'bg-primary/10 text-primary hover:bg-primary/20'
                           }`}
                title="Подробная подсказка"
              >
                ?
              </button>
            </div>

            {/* Подсказка */}
            <p className="text-xs text-text-light mb-2 ml-8">
              {field.hint}
            </p>

            {/* Развёрнутая подсказка (tooltip) */}
            {openTip === field.key && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-2 ml-8">
                <pre className="text-xs text-text whitespace-pre-wrap font-sans leading-relaxed">
                  {field.tip}
                </pre>
                <button
                  type="button"
                  onClick={() => setOpenTip(null)}
                  className="text-xs text-primary hover:text-primary-dark mt-2 cursor-pointer"
                >
                  ✕ Закрыть
                </button>
              </div>
            )}

            {/* Поле ввода — DatePicker для T, textarea для остальных */}
            {field.isDate ? (
              <div className="space-y-2">
                <input
                  type="date"
                  value={
                    values.timeBound.match(/^\d{4}-\d{2}-\d{2}$/)
                      ? values.timeBound
                      : ''
                  }
                  onChange={(e) => {
                    const formatted = formatDateRussian(e.target.value)
                    updateField('timeBound', formatted ? `До ${formatted}` : '')
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border
                             bg-surface text-text text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition-colors"
                />
                <textarea
                  value={values.timeBound}
                  onChange={(e) => updateField('timeBound', e.target.value)}
                  placeholder={field.placeholder}
                  rows={1}
                  className="w-full px-3 py-2 rounded-lg border border-border
                             bg-surface text-text placeholder-text-light/40 text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30
                             focus:border-primary transition-colors resize-none"
                />
                <p className="text-[10px] text-text-light ml-1">
                  Выберите дату в календаре или введите текст вручную
                </p>
              </div>
            ) : (
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
            )}
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