// ==========================================
// КОМПОНЕНТ: TaskTransferModal
// Перенос / дублирование задачи на другую дату
// С выбором причины и комментарием
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
  const [showCalendar, setShowCalendar] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const reset = () => {
    setStep('type')
    setTransferType('move')
    setReason('routine')
    setComment('')
    setTargetDate('')
    setError('')
    setShowCalendar(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  // Получить "завтра"
  const getTomorrow = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  // Форматирование даты для отображения
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    })
  }

  const handleConfirm = () => {
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
                  <p className="text-sm text-gray-500">Копия задачи появится на другом дне</p>
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

              {/* Комментарий — для "Не успел" и "Другое" */}
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
                onClick={() => { setStep('date'); setTargetDate(getTomorrow()) }}
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

              {/* Быстрые кнопки */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setTargetDate(getTomorrow()); setError('') }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all
                    ${targetDate === getTomorrow()
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }
                  `}
                >
                  Завтра
                </button>
                <button
                  onClick={() => setShowCalendar(true)}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 border-gray-200 hover:border-blue-400 text-gray-600 transition-all"
                >
                  📅 Выбрать дату
                </button>
              </div>

              {/* Выбранная дата */}
              {targetDate && (
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
                className={`w-full py-3 rounded-xl font-medium text-white transition-colors
                  ${transferType === 'move'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                  }
                `}
              >
                {transferType === 'move' ? '📦 Перенести' : '📋 Дублировать'}
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
          setError('')
        }}
      />
    </div>
  )
}