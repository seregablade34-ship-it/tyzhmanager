import { NavLink } from 'react-router-dom'
import { useCombo } from '../hooks/useCombo'
import { useAchievements } from '../hooks/useAchievements'

const NAV_ITEMS = [
  { to: '/',            icon: '📅', label: 'Ежедневник' },
  { to: '/strategy',    icon: '🎯', label: 'Стратегия 5 лет' },
  { to: '/goals',       icon: '🔍', label: 'Цели на год' },
  { to: '/evaluation',  icon: '⚖️', label: 'Оценка целей' },
  { to: '/cascade',     icon: '🪜', label: 'Экшен-каскадирование' },
  { to: '/pp-smart',    icon: '🧩', label: 'PP SMART' },
  { to: '/achievements',icon: '🏆', label: 'Достижения' },
  { to: '/stats',       icon: '📊', label: 'Статистика' },
  { to: '/settings',    icon: '⚙️', label: 'Настройки' },
  { to: '/about',       icon: 'ℹ️', label: 'О проекте' },
]

export default function Sidebar() {
  const { currentCombo, todayCompleted } = useCombo()
  const { rank, xpProgress, totalXp } = useAchievements()

  return (
    <aside className="w-56 h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0">

      {/* === ЛОГОТИП === */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold text-primary">#тыжменеджер</h1>
        <p className="text-xs text-text-light">дневник целей</p>
      </div>

      {/* === КОМБО + РАНГ === */}
      <div className="px-4 py-3 border-b border-border">
        {/* Комбо */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{currentCombo > 0 ? '🔥' : '💤'}</span>
          <div>
            <p className="text-sm font-semibold text-text">
              {currentCombo > 0
                ? `Комбо: ${currentCombo} ${currentCombo === 1 ? 'день' : currentCombo >= 2 && currentCombo <= 4 ? 'дня' : 'дней'}`
                : 'Нет комбо'
              }
            </p>
            <p className="text-xs text-text-light">
              {todayCompleted ? '✅ Сегодня есть!' : '⏳ Заполни ежедневник'}
            </p>
          </div>
        </div>

        {/* Ранг */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{rank.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text">{rank.title}</p>
            <p className="text-xs text-text-light">{totalXp} XP</p>
          </div>
        </div>

        {/* Прогресс-бар XP */}
        <div className="w-full bg-bg rounded-full h-1.5">
          <div
            className="bg-primary rounded-full h-1.5 transition-all duration-500"
            style={{ width: `${xpProgress.percent}%` }}
          />
        </div>
        <p className="text-xs text-text-light mt-1 text-right">
          {xpProgress.current}/{xpProgress.needed} XP
        </p>
      </div>

      {/* === НАВИГАЦИЯ === */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-white font-medium'
                  : 'text-text-light hover:bg-bg hover:text-text'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

    </aside>
  )
}