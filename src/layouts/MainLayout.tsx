import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Боковое меню — всегда слева */}
      <Sidebar />

      {/* Основная область — здесь отображается текущая страница */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}