import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { CoachingSession } from '../types'

interface Props {
  goalId: number
  goalTitle: string
  onBack: () => void
}

const QUESTIONS = [
  {
    emoji: '🎯',
    question: 'Что конкретно ты хочешь достичь?',
    hint: 'Опиши результат максимально конкретно, как будто он уже достигнут.',
  },
  {
    emoji: '🔥',
    question: 'Почему это важно для тебя?',
    hint: 'Какие ценности и мотивы стоят за этой целью?',
  },
  {
    emoji: '📍',
    question: 'Где ты сейчас по отношению к этой цели?',
    hint: 'Оцени текущее положение. Что уже сделано? Какой прогресс?',
  },
  {
    emoji: '🏆',
    question: 'Как ты поймёшь, что цель достигнута?',
    hint: 'Какие конкретные признаки, метрики, ощущения?',
  },
  {
    emoji: '🚧',
    question: 'Что тебе мешает прямо сейчас?',
    hint: 'Барьеры, страхи, ограничения — внешние и внутренние.',
  },
  {
    emoji: '💪',
    question: 'Какие ресурсы у тебя уже есть?',
    hint: 'Навыки, знания, люди, время, деньги — всё, что поможет.',
  },
  {
    emoji: '🛤️',
    question: 'Какой первый шаг ты можешь сделать?',
    hint: 'Самое маленькое конкретное действие — прямо сегодня.',
  },
  {
    emoji: '👥',
    question: 'Кто может тебе помочь?',
    hint: 'Люди, сообщества, менторы, партнёры.',
  },
  {
    emoji: '⚡',
    question: 'Что ты готов сделать на этой неделе?',
    hint: 'Конкретные действия с конкретными сроками.',
  },
  {
    emoji: '💎',
    question: 'Какой главный вывод ты сделал?',
    hint: 'Одно ключевое осознание после этого размышления.',
  },
]

export default function CoachingWizard({ goalId, goalTitle, onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''))
  const [existingId, setExistingId] = useState<number | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Загрузка существующих данных
  useEffect(() => {
    async function load() {
      try {
        const existing = await db.coachingSessions
          .where('goalId')
          .equals(goalId)
          .first()

        if (existing) {
          const loadedAnswers = [...Array(10).fill('')]
          existing.answers.forEach((a, i) => {
            if (i < 10) loadedAnswers[i] = a
          })
          setAnswers(loadedAnswers)
          setCurrentStep(existing.isCompleted ? 9 : existing.currentStep)
          setExistingId(existing.id!)
          setIsCompleted(existing.isCompleted)
          if (existing.isCompleted) setIsSaved(true)
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error)
      }
    }
    load()
  }, [goalId])

  // Обновить ответ
  function updateAnswer(value: string) {
    setAnswers(prev => {
      const updated = [...prev]
      updated[currentStep] = value
      return updated
    })
  }

  // Автосохранение при переходе
  async function autoSave(step: number, completed: boolean) {
    try {
      const now = new Date().toISOString()

      const record: CoachingSession = {
        goalId,
        answers: answers.filter(a => a.trim()),
        currentStep: step,
        isCompleted: completed,
        createdAt: now,
        updatedAt: now,
      }

      if (existingId) {
        record.id = existingId
        await db.coachingSessions.put(record)
      } else {
        const id = await db.coachingSessions.add(record)
        setExistingId(id as number)
      }
    } catch (error) {
      console.error('Ошибка автосохранения:', error)
    }
  }

  // Следующий шаг
  async function goNext() {
    if (currentStep < 9) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      await autoSave(nextStep, false)
    }
  }

  // Предыдущий шаг
  function goPrev() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Завершить
  async function handleComplete() {
    await autoSave(9, true)
    setIsCompleted(true)
    setIsSaved(true)
  }

  // Начать заново
  async function handleRestart() {
    setCurrentStep(0)
    setAnswers(Array(10).fill(''))
    setIsCompleted(false)
    setIsSaved(false)

    if (existingId) {
      try {
        await db.coachingSessions.delete(existingId)
        setExistingId(null)
      } catch (error) {
        console.error('Ошибка удаления:', error)
      }
    }
  }

  // Прогресс
  const answeredCount = answers.filter(a => a.trim() !== '').length
  const progressPercent = Math.round(((currentStep + 1) / QUESTIONS.length) * 100)
  const currentQ = QUESTIONS[currentStep]
  const currentAnswer = answers[currentStep]
  const canGoNext = currentAnswer.trim() !== ''

  // =============================================
  // Экран завершения
  // =============================================
  if (isCompleted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        {/* Назад */}
        <button
          onClick={onBack}
          className="text-sm text-primary hover:text-primary-dark
                     transition-colors cursor-pointer mb-4 flex items-center gap-1"
        >
          ← Назад к инструментам
        </button>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🎉</p>
          <h2 className="text-2xl font-bold text-text mb-2">
            Самокоучинг завершён!
          </h2>
          <p className="text-sm text-text-light">
            Цель: «{goalTitle}»
          </p>
        </div>

        {/* Все ответы */}
        <div className="space-y-3 mb-6">
          {QUESTIONS.map((q, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{q.emoji}</span>
                <h4 className="text-sm font-semibold text-text">{q.question}</h4>
              </div>
              <p className="text-sm text-text-light ml-8 leading-relaxed">
                {answers[idx] || '—'}
              </p>
            </div>
          ))}
        </div>

        {/* Вдохновение */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 text-center mb-6">
          <p className="text-3xl mb-3">💎</p>
          <h3 className="text-lg font-bold text-text mb-2">
            Ваши ответы сохранены
          </h3>
          <p className="text-sm text-text-light leading-relaxed max-w-md mx-auto">
            Перечитывайте их, когда теряете мотивацию.
            Вы уже знаете «зачем» и «как» — 
            осталось только действовать.
          </p>
        </div>

        {/* Кнопка пройти заново */}
        <div className="text-center">
          <button
            onClick={handleRestart}
            className="text-sm text-text-light hover:text-primary
                       transition-colors cursor-pointer"
          >
            🔄 Пройти заново
          </button>
        </div>
      </div>
    )
  }

  // =============================================
  // Wizard — пошаговый
  // =============================================
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Назад */}
      <button
        onClick={onBack}
        className="text-sm text-primary hover:text-primary-dark
                   transition-colors cursor-pointer mb-4 flex items-center gap-1"
      >
        ← Назад к инструментам
      </button>

      {/* Заголовок */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text">🧠 Мини-самокоучинг</h2>
        <p className="text-sm text-text-light mt-1">
          Цель: «{goalTitle}»
        </p>
      </div>

      {/* Прогресс-бар */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-light">
            Вопрос {currentStep + 1} из {QUESTIONS.length}
          </span>
          <span className="text-xs font-bold text-text">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-bg rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent === 100 ? 'bg-success' : 'bg-primary'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Точки шагов */}
        <div className="flex justify-between mt-2">
          {QUESTIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-6 h-6 rounded-full text-xs font-medium transition-all cursor-pointer
                ${idx === currentStep
                  ? 'bg-primary text-white scale-110'
                  : answers[idx].trim()
                    ? 'bg-success/20 text-success'
                    : 'bg-bg text-text-light'
                }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Карточка вопроса */}
      <div className="bg-surface border-2 border-primary/20 rounded-xl p-6 mb-6">
        <div className="text-center mb-4">
          <span className="text-4xl">{currentQ.emoji}</span>
        </div>

        <h3 className="text-lg font-bold text-text text-center mb-2">
          {currentQ.question}
        </h3>

        <p className="text-sm text-text-light text-center mb-5">
          {currentQ.hint}
        </p>

        <textarea
          value={currentAnswer}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder="Напишите свой ответ..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-border
                     bg-bg text-text placeholder-text-light/50
                     focus:outline-none focus:ring-2 focus:ring-primary/30
                     focus:border-primary transition-colors resize-none"
          autoFocus
        />
      </div>

      {/* Навигация */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer
            ${currentStep === 0
              ? 'text-text-light/30 cursor-not-allowed'
              : 'text-text-light hover:text-text hover:bg-bg'
            }`}
        >
          ← Назад
        </button>

        <span className="text-xs text-text-light">
          Отвечено: {answeredCount}/{QUESTIONS.length}
        </span>

        {currentStep < 9 ? (
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer
              ${canGoNext
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-border text-text-light cursor-not-allowed'
              }`}
          >
            Далее →
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={!canGoNext}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer
              ${canGoNext
                ? 'bg-success text-white hover:bg-success/90'
                : 'bg-border text-text-light cursor-not-allowed'
              }`}
          >
            ✅ Завершить
          </button>
        )}
      </div>
    </div>
  )
}