// ==========================================
// КОМПОНЕНТ: TaskTransferModal
// Перенос / дублирование задачи на другую дату
// С поддержкой дублирования на 1–7 дней
// ==========================================

import { useState } from 'react'
import { X, ArrowRight, Copy, RotateCcw, MessageSquare, AlertCircle } from 'lucide-react'
import CalendarPopup from './CalendarPopup'
import type { TransferReason } from '../types'

interface TaskTransferModalProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  currentDate: string // YYYY-MM-DD
  onConfirm: (data: {
    toDate: string
    type: 'move' | 'duplicate'
    reason: TransferReason
    comment?: string
  }) => void
}

const REASONS: { value: TransferReason; icon: string; label: string; needsComment: boolean }[] = [
  { value: 'routine',      icon: '🔄', label: 'Рутинная задача',  needsComment: false },
  { value: 'not-finished', icon: '⏰', label: 'Не успел',         needsComment: true },
  { value: 'other',        icon: '📝', label: 'Другое',           needsComment: true },
]

const MULTI_DAY_OPTIONS = [
  { days: 1, label: 'Завтра' },
  { days: 2, label: '2 дня' },
  { days: 3, label: '3 дня' },
  { days: 5, label: '5 дней' },
  { days: 7, label: '7 дней' },
]

// Получить дату через N дней
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// Форматирование даты
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
}

export default function TaskTransferModal({
  isOpen,
  onClose,
  taskTitle,
  currentDate,
  onConfirm,
}: TaskTransferModalProps) {
  const [step, setStep] = useState<'type' | 'reason' | 'date'>('type')
  const [transferType, setTransferType] = useState<'move' | 'duplicate'>('move')
  const [reason, setReason] = useState<TransferReason>('routine')
  const [comment, setComment] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [multiDays, setMultiDays] = useState(0) // 0 = ручной выбор, >0 = на N дней
  const [showCalendar, setShowCalendar] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const reset = () => {
    setStep('type')
    setTransferType('move')
    setReason('routine')
    setComment('')
    setTargetDate('')
    setMultiDays(0)
    setError('')
    setShowCalendar(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const getTomorrow = () => addDays(currentDate, 1)

  const handleConfirm = () => {
    // Дублирование на N дней
    if (transferType === 'duplicate' && multiDays > 0) {
      for (let i = 1; i <= multiDays; i++) {
        const date = addDays(currentDate, i)
        onConfirm({
          toDate: date,
          type: 'duplicate',
          reason,
          comment: comment.trim() || undefined,
        })
      }
      handleClose()
      return
    }

    // Обычный перенос/дубль на 1 дату
    if (!targetDate) {
      setError('Выберите дату')
      return
    }
    if (targetDate === currentDate) {
      setError('Выберите другую дату')
      return
    }

    const needsComment = REASONS.find(r => r.value === reason)?.needsComment
    if (needsComment && reason === 'not-finished' && !comment.trim()) {
      setError('Опишите причину')
      return
    }

    onConfirm({
      toDate: targetDate,
      type: transferType,
      reason,
      comment: comment.trim() || undefined,
    })
    handleClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[90vh] overflow-y-auto mx-4">
        {/* Шапка */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {transferType === 'move' ? '📦 Перенос задачи' : '📋 Дублирование задачи'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Название задачи */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-sm text-gray-500">Задача:</p>
          <p className="font-medium text-gray-800 truncate">{taskTitle}</p>
        </div>

        <div className="p-4 space-y-4">
          {/* ШАГ 1: Тип — перенос или дубль */}
          {step === 'type' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Что сделать с задачей?</p>

              <button
                onClick={() => { setTransferType('move'); setStep('reason') }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ArrowRight size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Перенести</p>
                  <p className="text-sm text-gray-500">Задача переместится на другой день</p>
                </div>
              </button>

              <button
                onClick={() => { setTransferType('duplicate'); setStep('reason') }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Copy size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Дублировать</p>
                  <p className="text-sm text-gray-500">Копия задачи на один или несколько дней</p>
                </div>
              </button>
            </div>
          )}

          {/* ШАГ 2: Причина */}
          {step === 'reason' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('type')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <RotateCcw size={16} className="text-gray-400" />
                </button>
                <p className="text-sm font-medium text-gray-600">Укажите причину:</p>
              </div>

              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setReason(r.value)
                    setError('')
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                    ${reason === r.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span className="font-medium text-gray-800">{r.label}</span>
                </button>
              ))}

              {/* Комментарий */}
              {(reason === 'not-finished' || reason === 'other') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <MessageSquare size={14} />
                    {reason === 'not-finished'
                      ? 'В чём была сложность? Есть план выполнить?'
                      : 'Комментарий (необязательно)'}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => { setComment(e.target.value); setError('') }}
                    placeholder={
                      reason === 'not-finished'
                        ? 'Опишите причину и план...'
                        : 'Ваш комментарий...'
                    }
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-sm"
                    rows={3}
                  />
                </div>
              )}

              <button
                onClick={() => {
                  setStep('date')
                  setTargetDate(getTomorrow())
                  setMultiDays(0)
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Далее — выбрать дату →
              </button>
            </div>
          )}

          {/* ШАГ 3: Выбор даты */}
          {step === 'date' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('reason')}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <RotateCcw size={16} className="text-gray-400" />
                </button>
                <p className="text-sm font-medium text-gray-600">Выберите дату:</p>
              </div>

              {/* === ДУБЛИРОВАНИЕ: быстрые кнопки на N дней === */}
              {transferType === 'duplicate' && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">🔄 Дублировать на несколько дней:</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {MULTI_DAY_OPTIONS.map(opt => (
                      <button
                        key={opt.days}
                        onClick={() => {
                          setMultiDays(opt.days)
                          setTargetDate('')
                          setError('')
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all
                          ${multiDays === opt.days
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 text-gray-600'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Показываем какие даты будут созданы */}
                  {multiDays > 0 && (
                    <div className="mt-2 bg-green-50 rounded-xl p-3">
                      <p className="text-xs text-green-700 font-medium mb-1">
                        📋 Задача будет создана на {multiDays} {multiDays === 1 ? 'день' : multiDays < 5 ? 'дня' : 'дней'}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from({ length: multiDays }, (_, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded-lg text-green-800 border border-green-200">
                            {formatDate(addDays(currentDate, i + 1))}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">или</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                </div>
              )}

              {/* Одиночная дата */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTargetDate(getTomorrow())
                    setMultiDays(0)
                    setError('')
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all
                    ${targetDate === getTomorrow() && multiDays === 0
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }
                  `}
                >
                  Завтра
                </button>
                <button
                  onClick={() => {
                    setMultiDays(0)
                    setShowCalendar(true)
                  }}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 border-gray-200 hover:border-blue-400 text-gray-600 transition-all"
                >
                  📅 Выбрать дату
                </button>
              </div>

              {/* Выбранная дата (если одиночная) */}
              {targetDate && multiDays === 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-gray-500">
                    {transferType === 'move' ? 'Перенести на:' : 'Дублировать на:'}
                  </p>
                  <p className="text-lg font-bold text-gray-800 mt-1">
                    📅 {formatDate(targetDate)}
                  </p>
                </div>
              )}

              {/* Сводка */}
              <div className="bg-blue-50 rounded-xl p-3 text-sm space-y-1">
                <p>
                  <span className="text-gray-500">Действие:</span>{' '}
                  <span className="font-medium">
                    {transferType === 'move' ? '📦 Перенос' : '📋 Дубль'}
                    {multiDays > 0 && ` на ${multiDays} ${multiDays === 1 ? 'день' : multiDays < 5 ? 'дня' : 'дней'}`}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Причина:</span>{' '}
                  <span className="font-medium">
                    {REASONS.find(r => r.value === reason)?.icon}{' '}
                    {REASONS.find(r => r.value === reason)?.label}
                  </span>
                </p>
                {comment && (
                  <p>
                    <span className="text-gray-500">Комментарий:</span>{' '}
                    <span className="text-gray-700">{comment}</span>
                  </p>
                )}
              </div>

              {/* Ошибка */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Кнопка подтверждения */}
              <button
                onClick={handleConfirm}
                disabled={multiDays === 0 && !targetDate}
                className={`w-full py-3 rounded-xl font-medium text-white transition-colors
                  ${multiDays === 0 && !targetDate
                    ? 'bg-gray-300 cursor-not-allowed'
                    : transferType === 'move'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }
                `}
              >
                {transferType === 'move'
                  ? '📦 Перенести'
                  : multiDays > 0
                    ? `📋 Дублировать на ${multiDays} ${multiDays === 1 ? 'день' : multiDays < 5 ? 'дня' : 'дней'}`
                    : '📋 Дублировать'
                }
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Встроенный CalendarPopup */}
      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        currentDate={targetDate || currentDate}
        onSelectDate={(date) => {
          setTargetDate(date)
          setMultiDays(0)
          setError('')
        }}
      />
    </div>
  )
}