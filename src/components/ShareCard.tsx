import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Download, Share2, X, Trophy, Flame, Target, Calendar } from 'lucide-react'

interface ShareCardProps {
  isOpen: boolean
  onClose: () => void
  goal: {
    title: string
    sphere: string
    progress: number
    status: 'active' | 'completed' | 'cancelled'
    year: number
  }
  combo?: number
}

const SPHERE_COLORS: Record<string, string> = {
  'Здоровье': '#22c55e',
  'Карьера': '#3b82f6',
  'Финансы': '#f59e0b',
  'Отношения': '#ec4899',
  'Семья': '#8b5cf6',
  'Развитие': '#06b6d4',
  'Хобби': '#f97316',
  'Духовность': '#a855f7',
}

export default function ShareCard({ isOpen, onClose, goal, combo = 0 }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const sphereColor = SPHERE_COLORS[goal.sphere] || '#3b82f6'
  const isCompleted = goal.status === 'completed'

  // Скачать как PNG
  const handleDownload = async () => {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `цель-${goal.title.slice(0, 20)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Ошибка при создании картинки:', e)
    }
    setSaving(false)
  }

  // Поделиться (если поддерживается)
  const handleShare = async () => {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], 'цель.png', { type: 'image/png' })
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '#тыжменеджер — моя цель',
            text: `🎯 ${goal.title}`,
            files: [file],
          })
        } else {
          // Если Share API не поддерживается — просто скачиваем
          handleDownload()
        }
        setSaving(false)
      })
    } catch (e) {
      console.error('Ошибка шеринга:', e)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 relative">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <h3 className="text-lg font-bold text-center mb-4 text-[var(--app-text)]">
          📸 Поделиться целью
        </h3>

        {/* ═══ КАРТОЧКА ДЛЯ СКРИНШОТА ═══ */}
        <div
          ref={cardRef}
          className="rounded-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${sphereColor}22, ${sphereColor}44)`,
            border: `2px solid ${sphereColor}66`,
          }}
        >
          <div className="p-6">
            {/* Верхняя полоска с брендом */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={18} style={{ color: sphereColor }} />
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: sphereColor }}
                >
                  {goal.sphere}
                </span>
              </div>
              {isCompleted && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500 text-white flex items-center gap-1">
                  <Trophy size={12} /> Достигнута!
                </span>
              )}
            </div>

            {/* Название цели */}
            <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
              🎯 {goal.title}
            </h2>

            {/* Прогресс-бар */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">Прогресс</span>
                <span className="font-bold" style={{ color: sphereColor }}>
                  {goal.progress}%
                </span>
              </div>
              <div className="h-3 bg-white/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: sphereColor,
                  }}
                />
              </div>
            </div>

            {/* Инфо-строка */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{goal.year}</span>
              </div>
              {combo > 0 && (
                <div className="flex items-center gap-1">
                  <Flame size={14} className="text-orange-500" />
                  <span className="font-medium">Комбо: {combo} дн.</span>
                </div>
              )}
            </div>

            {/* Бренд */}
            <div className="mt-4 pt-3 border-t border-gray-300/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">#тыжменеджер</p>
                <p className="text-xs text-gray-500">дневник целей</p>
              </div>
              <p className="text-xs text-gray-400">t.me/degtayrevtrener</p>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Download size={18} />
            {saving ? 'Сохраняю...' : 'Скачать PNG'}
          </button>
          <button
            onClick={handleShare}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            <Share2 size={18} />
            Поделиться
          </button>
        </div>
      </div>
    </div>
  )
}