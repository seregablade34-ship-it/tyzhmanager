import { useEffect } from 'react'
import type { UnlockedAchievement } from '../hooks/useAchievements'
import { fireAchievementConfetti } from '../hooks/useConfetti'

interface AchievementToastProps {
  achievement: UnlockedAchievement
  onDismiss: () => void
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {

  useEffect(() => {
    // Запускаем конфетти при появлении
    fireAchievementConfetti()

    // Автоматически скрываем через 5 секунд
    const timer = setTimeout(() => {
      onDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div className="bg-surface border-2 border-primary rounded-xl shadow-2xl p-4 max-w-sm">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            🏅 Новое достижение!
          </span>
          <button
            onClick={onDismiss}
            className="text-text-light hover:text-text cursor-pointer text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Контент */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">{achievement.icon}</span>
          <div>
            <p className="font-bold text-text">{achievement.title}</p>
            <p className="text-sm text-text-light">{achievement.description}</p>
            <p className="text-xs text-primary mt-1 font-medium">
              +{achievement.xp} XP ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}