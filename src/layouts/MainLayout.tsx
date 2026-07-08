import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AchievementToast from '../components/AchievementToast'
import { useAchievements } from '../hooks/useAchievements'

export default function MainLayout() {
  const { newAchievement, dismissNew } = useAchievements()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  // Скролл наверх при смене страницы
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Боковое меню — всегда слева */}
      <Sidebar />

      {/* Основная область — здесь отображается текущая страница */}
      <main
        ref={mainRef}
        className="flex-1 overflow-auto ml-56"
      >
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