import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { DescartesSquare } from '../types'

interface Props {
  goalId: number
  goalTitle: string
  onBack: () => void
}

const QUESTIONS = [
  { key: 'doPositive', emoji: '✅', question: 'Что случится, если я это СДЕЛАЮ?' },
  { key: 'dontNegative', emoji: '❌', question: 'Что случится, если я это НЕ сделаю?' },
  { key: 'doNegative', emoji: '⚠️', question: 'Чего НЕ случится, если я это СДЕЛАЮ?' },
  { key: 'dontPositive', emoji: '🔄', question: 'Чего НЕ случится, если я это НЕ сделаю?' },
] as const

type QuadrantKey = 'doPositive' | 'dontNegative' | 'doNegative' | 'dontPositive'

export default function DescartesSquareForm({ goalId, goalTitle, onBack }: Props) {
  const [data, setData] = useState<Record<QuadrantKey, string[]>>({
    doPositive: ['', '', ''],
    dontNegative: ['', '', ''],
    doNegative: ['', '', ''],
    dontPositive: ['', '', ''],
  })
  const [existingId, setExistingId] = useState<number | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // Загрузка существующих данных
  useEffect(() => {
    async function load() {
      try {
        const existing = await db.descartesSquares
          .where('goalId')
          .equals(goalId)
          .first()

        if (existing) {
          setData({
            doPositive: existing.doPositive.length >= 3
              ? existing.doPositive
              : [...existing.doPositive, ...Array(3 - existing.doPositive.length).fill('')],
            dontNegative: existing.dontNegative.length >= 3
              ? existing.dontNegative
              : [...existing.dontNegative, ...Array(3 - existing.dontNegative.length).fill('')],
            doNegative: existing.doNegative.length >= 3
              ? existing.doNegative
              : [...existing.doNegative, ...Array(3 - existing.doNegative.length).fill('')],
            dontPositive: existing.dontPositive.length >= 3
              ? existing.dontPositive
              : [...existing.dontPositive, ...Array(3 - existing.dontPositive.length).fill('')],
          })
          setExistingId(existing.id!)
          setIsSaved(true)
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error)
      }
    }
    load()
  }, [goalId])

  // Обновить ответ
  function updateAnswer(quadrant: QuadrantKey, index: number, value: string) {
    setData(prev => {
      const updated = { ...prev }
      updated[quadrant] = [...prev[quadrant]]
      updated[quadrant][index] = value
      return updated
    })
    setIsSaved(false)
  }

  // Добавить ещё поле ответа
  function addAnswer(quadrant: QuadrantKey) {
    setData(prev => {
      const updated = { ...prev }
      updated[quadrant] = [...prev[quadrant], '']
      return updated
    })
  }

  // Удалить поле ответа (минимум 3)
  function removeAnswer(quadrant: QuadrantKey, index: number) {
    if (data[quadrant].length <= 3) return
    setData(prev => {
      const updated = { ...prev }
      updated[quadrant] = prev[quadrant].filter((_, i) => i !== index)
      return updated
    })
  }

  // Подсчёт заполненных ответов в квадранте
  function filledCount(quadrant: QuadrantKey): number {
    return data[quadrant].filter(a => a.trim() !== '').length
  }

  // Все ли квадранты имеют минимум 3 ответа?
  function isComplete(): boolean {
    return QUESTIONS.every(q => filledCount(q.key) >= 3)
  }

  // Сохранить
  async function handleSave() {
    try {
      const now = new Date().toISOString()

      const record: DescartesSquare = {
        goalId,
        doPositive: data.doPositive.filter(a => a.trim()),
        dontNegative: data.dontNegative.filter(a => a.trim()),
        doNegative: data.doNegative.filter(a => a.trim()),
        dontPositive: data.dontPositive.filter(a => a.trim()),
        recommendation: 'do',  // Поле оставляем для совместимости, не используем
        createdAt: now,
        updatedAt: now,
      }

      if (existingId) {
        record.id = existingId
        await db.descartesSquares.put(record)
      } else {
        const id = await db.descartesSquares.add(record)
        setExistingId(id as number)
      }

      setIsSaved(true)
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
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
        <h2 className="text-2xl font-bold text-text">🔲 Квадрат Декарта</h2>
        <p className="text-sm text-text-light mt-1">
          Цель: «{goalTitle}»
        </p>
        <p className="text-xs text-text-light mt-2">
          💡 Ответьте минимум на 3 вопроса в каждом блоке для получения рекомендации
        </p>
      </div>

      {/* 4 квадранта */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {QUESTIONS.map(q => (
          <div key={q.key} className="bg-surface border border-border rounded-xl p-4">
            <h3 className="font-semibold text-text mb-3 text-sm">
              {q.emoji} {q.question}
            </h3>

            <div className="space-y-2">
              {data[q.key].map((answer, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs text-text-light w-4 text-right">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => updateAnswer(q.key, idx, e.target.value)}
                    placeholder={`Ответ ${idx + 1}...`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border
                               bg-bg text-text placeholder-text-light/50 text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/30
                               focus:border-primary transition-colors"
                  />
                  {data[q.key].length > 3 && (
                    <button
                      onClick={() => removeAnswer(q.key, idx)}
                      className="text-text-light hover:text-danger text-xs
                                 cursor-pointer transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Кнопка добавить ответ */}
            <button
              onClick={() => addAnswer(q.key)}
              className="mt-2 text-xs text-primary hover:text-primary-dark
                         cursor-pointer transition-colors"
            >
              + Добавить ответ
            </button>

            {/* Счётчик */}
            <div className="mt-2 text-right">
              <span className={`text-xs ${
                filledCount(q.key) >= 3 ? 'text-success' : 'text-text-light'
              }`}>
                {filledCount(q.key) >= 3 ? '✅' : '⚪'} {filledCount(q.key)}/3 мин.
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка сохранения */}
      <div className="text-center mb-6">
        <button
          onClick={handleSave}
          disabled={!isComplete()}
          className={`px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer
            ${isComplete()
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-border text-text-light cursor-not-allowed'
            }`}
        >
          {isSaved ? '💾 Обновить ответы' : '💾 Сохранить ответы'}
        </button>

        {!isComplete() && (
          <p className="text-xs text-text-light mt-2">
            Заполните минимум 3 ответа в каждом блоке
          </p>
        )}
      </div>

      {/* Рекомендация — после сохранения */}
      {isSaved && (
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 text-center">
          <p className="text-3xl mb-3">📖</p>
          <h3 className="text-lg font-bold text-text mb-2">
            Ваши ответы сохранены
          </h3>
          <p className="text-sm text-text-light leading-relaxed max-w-md mx-auto">
            Перечитайте внимательно свои ответы в каждом квадранте. 
            Сравните аргументы «за» и «против». 
            Решение — за вами. Квадрат Декарта помогает увидеть картину целиком, 
            а выбор всегда остаётся вашим.
          </p>
        </div>
      )}
    </div>
  )
}