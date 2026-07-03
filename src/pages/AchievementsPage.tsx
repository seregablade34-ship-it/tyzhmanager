import { useAchievements, ACHIEVEMENTS, type AchievementDef } from '../hooks/useAchievements'
import { useCombo } from '../hooks/useCombo'

// Все ранги для отображения
const ALL_RANKS = [
  { level: 1, title: 'Новичок',       icon: '🌱', minXp: 0 },
  { level: 2, title: 'Практик',       icon: '📝', minXp: 50 },
  { level: 3, title: 'Планировщик',   icon: '📋', minXp: 150 },
  { level: 4, title: 'Стратег',       icon: '🎯', minXp: 300 },
  { level: 5, title: 'Профессионал',  icon: '💼', minXp: 500 },
  { level: 6, title: 'Эксперт',       icon: '🏆', minXp: 800 },
  { level: 7, title: 'Мастер целей',  icon: '👑', minXp: 1200 },
  { level: 8, title: 'Легенда',       icon: '💎', minXp: 2000 },
]

// Категории для группировки
const CATEGORIES: { key: string; title: string; icon: string }[] = [
  { key: 'combo',   title: 'Комбо',       icon: '🔥' },
  { key: 'goals',   title: 'Цели',        icon: '🎯' },
  { key: 'daily',   title: 'Ежедневник',  icon: '📝' },
  { key: 'tools',   title: 'Инструменты', icon: '🛠️' },
  { key: 'special', title: 'Особые',      icon: '⭐' },
]

export default function AchievementsPage() {
  const {
    unlocked,
    totalXp,
    rank,
    xpProgress,
    isLoading,
  } = useAchievements()
  const { currentCombo, maxCombo } = useCombo()

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  const unlockedIds = new Set(unlocked.map((a: { id: string }) => a.id))
  const unlockedCount = unlocked.length
  const totalCount = ACHIEVEMENTS.length

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* === ЗАГОЛОВОК === */}
      <h1 className="text-2xl font-bold text-text mb-6">🏆 Достижения</h1>

      {/* === ОБЩАЯ СТАТИСТИКА === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Ранг */}
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <span className="text-4xl block mb-2">{rank.icon}</span>
          <p className="font-bold text-text">{rank.title}</p>
          <p className="text-xs text-text-light">Текущий ранг</p>
        </div>

        {/* XP */}
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary mb-1">{totalXp}</p>
          <p className="text-sm text-text-light">Очков опыта (XP)</p>
        </div>

        {/* Комбо */}
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-warning mb-1">🔥 {currentCombo}</p>
          <p className="text-sm text-text-light">
            Текущее комбо {currentCombo === 1 ? 'день' : currentCombo >= 2 && currentCombo <= 4 ? 'дня' : 'дней'}
          </p>
        </div>

        {/* Бейджи */}
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-success mb-1">{unlockedCount}/{totalCount}</p>
          <p className="text-sm text-text-light">Бейджей открыто</p>
        </div>
      </div>

      {/* === ПРОГРЕСС ДО СЛЕДУЮЩЕГО РАНГА === */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-text">Прогресс до следующего ранга</p>
          <p className="text-sm text-text-light">
            {xpProgress.current} / {xpProgress.needed} XP
          </p>
        </div>
        <div className="w-full bg-bg rounded-full h-3">
          <div
            className="bg-primary rounded-full h-3 transition-all duration-500"
            style={{ width: `${xpProgress.percent}%` }}
          />
        </div>

        {/* Все ранги */}
        <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
          {ALL_RANKS.map((r: { icon: string; title: string; minXp: number }, i: number) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 ${
                r.title === rank.title
                  ? 'opacity-100'
                  : totalXp >= r.minXp
                    ? 'opacity-60'
                    : 'opacity-30'
              }`}
            >
              <span className="text-2xl">{r.icon}</span>
              <span className="text-xs text-text-light">{r.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === РЕКОРД КОМБО === */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-8">
        <p className="font-semibold text-text mb-2">🔥 Рекорд комбо</p>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold text-warning">{maxCombo}</p>
            <p className="text-xs text-text-light">Лучшая серия</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-2xl font-bold text-primary">{currentCombo}</p>
            <p className="text-xs text-text-light">Текущая серия</p>
          </div>
        </div>
      </div>

      {/* === ВСЕ БЕЙДЖИ ПО КАТЕГОРИЯМ === */}
      {CATEGORIES.map((cat: { key: string; title: string; icon: string }) => {
        const badges = ACHIEVEMENTS.filter((a: AchievementDef) => a.category === cat.key)
        return (
          <div key={cat.key} className="bg-surface border border-border rounded-xl p-5 mb-4">
            <p className="font-semibold text-text mb-4">
              {cat.icon} {cat.title}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {badges.map((badge: AchievementDef) => {
                const isUnlocked = unlockedIds.has(badge.id)
                const unlockedData = unlocked.find((u: { id: string }) => u.id === badge.id)
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                        : 'bg-bg border-border opacity-50'
                    }`}
                  >
                    <span className="text-3xl">
                      {isUnlocked ? badge.icon : '🔒'}
                    </span>
                    <div className="flex-1">
                      <p className={`font-medium ${isUnlocked ? 'text-text' : 'text-text-light'}`}>
                        {badge.title}
                      </p>
                      <p className="text-xs text-text-light">{badge.description}</p>
                      {isUnlocked && unlockedData?.unlockedAt && (
                        <p className="text-xs text-success mt-1">
                          ✅ Получено: {new Date(unlockedData.unlockedAt).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-primary">
                      +{badge.xp} XP
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

    </div>
  )
}