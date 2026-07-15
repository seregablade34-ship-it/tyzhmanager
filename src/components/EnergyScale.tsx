import { useState, useEffect, useRef, useCallback } from 'react'
import { db } from '../db/database'

interface EnergyScaleProps {
  value: number | undefined
  onChange: (value: number) => void
  valueEvening?: number | undefined
  onChangeEvening?: (value: number) => void
  anchor?: string
  onAnchorChange?: (value: string) => void
  date?: string
}

// ─── ЭМОДЗИ ───
const ENERGY_EMOJI: Record<number, string> = {
  0: '💀', 1: '😴', 2: '😩', 3: '😔',
  4: '😐', 5: '🙂', 6: '😊',
  7: '😄', 8: '🔥', 9: '⚡', 10: '🚀',
}

// ─── РЕКОМЕНДАЦИИ (авторские) ───
const RECOMMENDATIONS: Record<number, string> = {
  0:  'Полный стоп. Только отдых или сон 15–90 мин.',
  1:  'Полный стоп. Только отдых или сон 15–90 мин.',
  2:  'Механические задачи: разобрать почту, протереть стол.',
  3:  'Микро-ритуал: стакан воды + 5 мин у окна.',
  4:  'Помидор 25/5, но сначала разминка 2 мин.',
  5:  'Сначала лягушка — сложная задача первой.',
  6:  'Правило 90 минут — потом перерыв 10 мин.',
  7:  'Бери задачи с неопределённостью: креатив, стратегия.',
  8:  'Deep Work 2 часа без интернета и уведомлений.',
  9:  'Торможение! Выбери ТОЛЬКО 1 задачу, не хватайся за всё.',
  10: 'Перерыв 5 мин! Используй для проверки сделанного.',
}

// ─── ЦВЕТА ───
function getZoneColor(level: number) {
  if (level <= 1) return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100', border: 'border-red-200' }
  if (level <= 3) return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200' }
  if (level <= 6) return { bg: 'bg-gray-400', text: 'text-gray-600', light: 'bg-gray-50', border: 'border-gray-200' }
  if (level <= 8) return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' }
  return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50', border: 'border-yellow-200' }
}

function getSliderGradient(): string {
  return 'linear-gradient(to right, #ef4444 0%, #f97316 20%, #9ca3af 40%, #22c55e 70%, #eab308 90%, #eab308 100%)'
}

// ─── ОПРЕДЕЛЕНИЕ ВРЕМЕНИ СУТОК ───
function getTimeOfDay(): 'morning' | 'evening' {
  return new Date().getHours() < 14 ? 'morning' : 'evening'
}

export default function EnergyScale({
  value, onChange,
  valueEvening, onChangeEvening,
  anchor, onAnchorChange,
  date,
}: EnergyScaleProps) {
  const timeOfDay = getTimeOfDay()
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [weekHistory, setWeekHistory] = useState<{ date: string; energy: number | null }[]>([])
  const [yesterdayEnergy, setYesterdayEnergy] = useState<number | null>(null)

  // Текущие значения в зависимости от времени
  const currentValue = timeOfDay === 'morning' ? value : valueEvening
  const currentOnChange = timeOfDay === 'morning' ? onChange : (onChangeEvening || onChange)
  const otherValue = timeOfDay === 'morning' ? valueEvening : value

  // Загрузка истории за 7 дней
  useEffect(() => {
    loadHistory()
  }, [date])

  async function loadHistory() {
    try {
      const entries = await db.dailyEntries.toArray()
      const today = new Date()
      const days: { date: string; energy: number | null }[] = []

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const entry = entries.find(e => e.date === dateStr)
        days.push({
          date: dateStr,
          energy: entry?.energyLevel ?? null,
        })
      }

      setWeekHistory(days)

      // Вчерашняя энергия для тренда
      const yesterday = days[days.length - 2]
      setYesterdayEnergy(yesterday?.energy ?? null)
    } catch (error) {
      console.error('Ошибка загрузки истории энергии:', error)
    }
  }

  // ─── СЛАЙДЕР ЛОГИКА ───
  const updateFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(1, x / rect.width))
    const level = Math.round(percent * 10)
    currentOnChange(level)
  }, [currentOnChange])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    updateFromPosition(e.clientX)
  }, [updateFromPosition])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    updateFromPosition(e.touches[0].clientX)
  }, [updateFromPosition])

  useEffect(() => {
    if (!isDragging) return

    function handleMove(e: MouseEvent | TouchEvent) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      updateFromPosition(clientX)
    }

    function handleUp() {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove, { passive: true })
    window.addEventListener('touchend', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [isDragging, updateFromPosition])

  // ─── ТРЕНД ───
  function getTrend(): { icon: string; text: string; color: string } | null {
    if (currentValue === undefined || yesterdayEnergy === null) return null
    const diff = currentValue - yesterdayEnergy
    if (diff > 0) return { icon: '↑', text: `+${diff} к вчера`, color: 'text-green-600' }
    if (diff < 0) return { icon: '↓', text: `${diff} к вчера`, color: 'text-red-500' }
    return { icon: '→', text: 'как вчера', color: 'text-gray-500' }
  }

  // ─── «МИНУС 2» ───
  function getMinus2Warning(): string | null {
    if (currentValue === undefined || yesterdayEnergy === null) return null
    if (yesterdayEnergy - currentValue >= 2) {
      return '⚠️ Энергия упала на 2+. Что случилось? Возможно, стоит снизить нагрузку.'
    }
    return null
  }

  const trend = getTrend()
  const minus2 = getMinus2Warning()
  const zone = currentValue !== undefined ? getZoneColor(currentValue) : null

  // ─── МИНИ-ГРАФИК ───
  const maxEnergy = 10
  const graphHeight = 48
  const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  function getDayOfWeekIndex(dateStr: string): number {
    const d = new Date(dateStr)
    return (d.getDay() + 6) % 7 // Пн=0
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">

      {/* ═══ ЗАГОЛОВОК ═══ */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-text">⚡ Энергия</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            timeOfDay === 'morning'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-indigo-100 text-indigo-700'
          }`}>
            {timeOfDay === 'morning' ? '☀️ утро' : '🌙 вечер'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Тренд */}
          {trend && (
            <span className={`text-xs font-medium ${trend.color}`}>
              {trend.icon} {trend.text}
            </span>
          )}
          {/* Число */}
          {currentValue !== undefined && zone && (
            <span className={`text-2xl font-bold ${zone.text}`}>
              {ENERGY_EMOJI[currentValue]} {currentValue}
            </span>
          )}
        </div>
      </div>

      {/* Второй замер (если есть) */}
      {otherValue !== undefined && (
        <p className="text-xs text-text-light mb-2">
          {timeOfDay === 'morning'
            ? `🌙 Вечерний замер: ${ENERGY_EMOJI[otherValue]} ${otherValue}/10`
            : `☀️ Утренний замер: ${ENERGY_EMOJI[otherValue]} ${otherValue}/10`
          }
        </p>
      )}

      {/* ═══ СЛАЙДЕР ═══ */}
      <div className="mb-3 pt-2">
        {/* Эмодзи-метки */}
        <div className="flex justify-between mb-1 px-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <button
              key={i}
              onClick={() => currentOnChange(i)}
              className={`text-sm cursor-pointer transition-all ${
                currentValue === i ? 'scale-150 drop-shadow-md' : 'opacity-40 hover:opacity-70'
              }`}
            >
              {ENERGY_EMOJI[i]}
            </button>
          ))}
        </div>

        {/* Полоска слайдера */}
        <div
          ref={sliderRef}
          className="relative h-8 rounded-full cursor-pointer select-none touch-none"
          style={{ background: getSliderGradient() }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Заполнение */}
          {currentValue !== undefined && (
            <div
              className="absolute top-0 left-0 h-full rounded-full opacity-30 bg-white"
              style={{ width: `${100 - (currentValue / 10) * 100}%`, right: 0, left: 'auto' }}
            />
          )}

          {/* Ползунок */}
          {currentValue !== undefined && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7
                         bg-white rounded-full shadow-lg border-2 border-white
                         flex items-center justify-center text-sm font-bold
                         transition-[left] duration-100"
              style={{ left: `${(currentValue / 10) * 100}%` }}
            >
              {currentValue}
            </div>
          )}

          {/* Плейсхолдер */}
          {currentValue === undefined && (
            <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm font-medium">
              ← Потяните или нажмите →
            </div>
          )}
        </div>

        {/* Метки 0 и 10 */}
        <div className="flex justify-between mt-1 px-1">
          <span className="text-[10px] text-text-light">0 — без сил</span>
          <span className="text-[10px] text-text-light">10 — максимум</span>
        </div>
      </div>

      {/* ═══ РЕКОМЕНДАЦИЯ ═══ */}
      {currentValue !== undefined && zone && (
        <div className={`${zone.light} ${zone.border} border rounded-lg px-3 py-2 mb-3`}>
          <p className={`text-xs ${zone.text} font-medium`}>
            💡 {RECOMMENDATIONS[currentValue]}
          </p>
        </div>
      )}

      {/* ═══ ПРЕДУПРЕЖДЕНИЕ «МИНУС 2» ═══ */}
      {minus2 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-red-600 font-medium">{minus2}</p>
        </div>
      )}

      {/* ═══ ЯКОРЬ — ощущение в теле ═══ */}
      {currentValue !== undefined && onAnchorChange && (
        <div className="mb-3">
          <label className="text-xs text-text-light mb-1 block">
            🫀 Энергетический якорь — одним словом, что чувствуешь в теле?
          </label>
          <input
            type="text"
            value={anchor || ''}
            onChange={(e) => onAnchorChange(e.target.value)}
            placeholder="лёгкость, тяжесть, бодрость, сонливость..."
            maxLength={30}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm
                       placeholder-text-light/50 focus:outline-none focus:ring-2
                       focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      )}

      {/* ═══ МИНИ-ГРАФИК 7 ДНЕЙ ═══ */}
      {weekHistory.length > 0 && (
        <div>
          <p className="text-xs text-text-light mb-2">📊 Энергия за неделю:</p>
          <div className="flex items-end gap-1.5 justify-between">
            {weekHistory.map((day, i) => {
              const h = day.energy !== null
                ? Math.max(4, (day.energy / maxEnergy) * graphHeight)
                : 4
              const isToday = i === weekHistory.length - 1
              const dayColor = day.energy !== null ? getZoneColor(day.energy) : null

              return (
                <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                  {/* Значение */}
                  <span className="text-[10px] text-text-light">
                    {day.energy !== null ? day.energy : '·'}
                  </span>
                  {/* Столбик */}
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      day.energy !== null
                        ? dayColor!.bg
                        : 'bg-border'
                    } ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                    style={{ height: `${h}px` }}
                  />
                  {/* День недели */}
                  <span className={`text-[10px] ${isToday ? 'text-primary font-bold' : 'text-text-light'}`}>
                    {WEEKDAYS_SHORT[getDayOfWeekIndex(day.date)]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}