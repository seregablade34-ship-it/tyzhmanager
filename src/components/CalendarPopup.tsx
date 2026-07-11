// ==========================================
// КОМПОНЕНТ: CalendarPopup — всплывающий календарь
// Используется для выбора даты + навигация по месяцам
// ==========================================

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarPopupProps {
  isOpen: boolean
  onClose: () => void
  onSelectDate: (date: string) => void
  currentDate: string // формат YYYY-MM-DD
}

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель',
  'Май', 'Июнь', 'Июль', 'Август',
  'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function CalendarPopup({ isOpen, onClose, onSelectDate, currentDate }: CalendarPopupProps) {
  const [viewYear, setViewYear] = useState(2026)
  const [viewMonth, setViewMonth] = useState(0) // 0-11
  const popupRef = useRef<HTMLDivElement>(null)

  // При открытии — показываем месяц текущей даты
  useEffect(() => {
    if (isOpen && currentDate) {
      const d = new Date(currentDate)
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [isOpen, currentDate])

  // Закрытие по клику вне попапа
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Получаем дни месяца
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1)
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  // День недели первого дня (0=Вс, 1=Пн...)
  let startDay = firstDayOfMonth.getDay()
  // Переводим в формат Пн=0, Вс=6
  startDay = startDay === 0 ? 6 : startDay - 1

  // Формируем массив дней
  const days: (number | null)[] = []
  // Пустые ячейки до первого дня
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  // Дни месяца
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d)
  }

  // Сегодня
  const todayStr = new Date().toISOString().split('T')[0]

  // Навигация
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleDayClick = (day: number) => {
    const month = String(viewMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${viewYear}-${month}-${dayStr}`
    onSelectDate(dateStr)
    onClose()
  }

  // Проверки
  const isToday = (day: number) => {
    const month = String(viewMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${viewYear}-${month}-${dayStr}` === todayStr
  }

  const isSelected = (day: number) => {
    const month = String(viewMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${viewYear}-${month}-${dayStr}` === currentDate
  }

  const isWeekend = (index: number) => {
    const dayOfWeek = index % 7
    return dayOfWeek === 5 || dayOfWeek === 6 // Сб, Вс
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/30">
      <div
        ref={popupRef}
        className="bg-white rounded-2xl shadow-2xl p-4 w-[340px] animate-in fade-in zoom-in duration-200"
      >
        {/* Шапка */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <span className="font-bold text-lg">
              {MONTHS[viewMonth]}
            </span>
            <span className="ml-2 text-gray-500">
              {viewYear}
            </span>
          </div>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-1 ${
                i >= 5 ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Дни */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className="aspect-square">
              {day !== null ? (
                <button
                  onClick={() => handleDayClick(day)}
                  className={`w-full h-full flex items-center justify-center rounded-lg text-sm font-medium transition-all
                    ${isSelected(day)
                      ? 'bg-blue-600 text-white shadow-md'
                      : isToday(day)
                        ? 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-300'
                        : isWeekend(index)
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {day}
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {/* Кнопка "Сегодня" */}
        <button
          onClick={() => {
            onSelectDate(todayStr)
            onClose()
          }}
          className="w-full mt-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          📌 Сегодня
        </button>
      </div>
    </div>
  )
}