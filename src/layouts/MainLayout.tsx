import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AchievementToast from '../components/AchievementToast'
import { useAchievements } from '../hooks/useAchievements'

export default function MainLayout() {
  const { newAchievement, dismissNew } = useAchievements()

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Боковое меню — всегда слева */}
      <Sidebar />

      {/* Основная область — здесь отображается текущая страница */}
      <main className="flex-1 overflow-auto ml-56">
        <Outlet />
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