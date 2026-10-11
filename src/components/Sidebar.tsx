import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NAV_GROUPS = [
  {
    label: 'Ежедневник',
    items: [
      { to: '/', icon: '📅', label: 'Ежедневник' },
    ],
  },
  {
    label: 'Цели',
    items: [
      { to: '/goals',      icon: '🎯', label: 'Мои цели' },
      { to: '/three-p',    icon: '🔍', label: 'Метод 3П' },
      { to: '/coaching',   icon: '💬', label: 'Самокоучинг' },
      { to: '/cascade',    icon: '🪜', label: 'Экшен-каскад' },
      { to: '/pp-smart',   icon: '🧩', label: 'PP SMART' },
    ],
  },
  {
    label: 'Аналитика',
    items: [
      { to: '/stats', icon: '📊', label: 'Статистика' },
    ],
  },
  {
    label: '',
    items: [
      { to: '/settings',    icon: '⚙️', label: 'Настройки' },
      { to: '/about',       icon: 'ℹ️', label: 'О проекте' },
      { to: '/instruction', icon: '📖', label: 'Инструкция' },
    ],
  },
]

export default function Sidebar() {

  async function handleLogout() {
    localStorage.removeItem('tyzhmanager_remember')
    await supabase.auth.signOut()
  }

  return (
    <aside className="w-56 h-full bg-surface border-r border-border flex flex-col overflow-y-auto">

      {/* === ЛОГОТИП === */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold text-primary">#тыжменеджер</h1>
        <p className="text-xs text-text-light">дневник целей</p>
      </div>

      {/* === НАВИГАЦИЯ === */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.label && (
              <div className="px-4 pt-4 pb-1 first:pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-light/60">
                  {group.label}
                </p>
              </div>
            )}

            {!group.label && (
              <div className="mx-4 my-2 border-t border-border" />
            )}

            {group.items.map(item => (
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
          </div>
        ))}
      </nav>

      {/* === ВЫХОД === */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm
                     text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600
                     transition-colors cursor-pointer"
        >
          <span className="text-base">🚪</span>
          Выйти
        </button>
      </div>

    </aside>
  )
}