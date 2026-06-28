import { NavLink } from 'react-router-dom'

const menuItems = [
  { path: '/', icon: '📅', label: 'Ежедневник' },
  { path: '/strategy', icon: '🎯', label: 'Стратегия 5 лет' },
  { path: '/goals', icon: '🔍', label: 'Цели на год' },
  { path: '/evaluation', icon: '⚖️', label: 'Оценка целей' },
  { path: '/cascade', icon: '🔨', label: 'Экшен-каскадирование' },
  { path: '/pp-smart', icon: '🎯', label: 'PP SMART' },
  { path: '/achievements', icon: '🏅', label: 'Достижения' },
  { path: '/stats', icon: '📈', label: 'Статистика' },
  { path: '/settings', icon: '⚙️', label: 'Настройки' },
  { path: '/about', icon: 'ℹ️', label: 'О проекте' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen p-4 flex flex-col">
      {/* Логотип */}
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold text-primary">#тыжменеджер</h1>
        <p className="text-xs text-text-light mt-1">дневник целей</p>
      </div>

      {/* Меню */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-white font-medium'
                  : 'text-text hover:bg-bg'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}