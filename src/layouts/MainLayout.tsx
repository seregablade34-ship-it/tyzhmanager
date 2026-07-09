import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AchievementToast from '../components/AchievementToast'
import { useAchievements } from '../hooks/useAchievements'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { newAchievement, dismissNew } = useAchievements()

  // Автоматически закрываем сайдбар при переходе на другую страницу
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-bg">

      {/* ===== МОБИЛЬНЫЙ ХЕДЕР (виден только на экранах < 768px) ===== */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center h-14 px-4 bg-surface border-b border-border md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-text hover:bg-bg rounded-lg cursor-pointer"
          aria-label="Открыть меню"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="ml-3 text-lg font-bold text-primary">
          #тыжменеджер
        </span>
      </header>

      {/* ===== ЗАТЕМНЕНИЕ при открытом сайдбаре (мобильное) ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== САЙДБАР ===== */}
      <div
        className={`
          fixed top-0 left-0 h-full z-50 shrink-0
          transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar />
      </div>

      {/* ===== ОСНОВНОЙ КОНТЕНТ ===== */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Глобальный toast — уведомление о достижении */}
      {newAchievement && (
        <AchievementToast
          achievement={newAchievement}
          onDismiss={dismissNew}
        />
      )}
    </div>
  )
}