import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DailyPage from './pages/DailyPage'
import StrategyPage from './pages/StrategyPage'
import GoalsPage from './pages/GoalsPage'
import EvaluationPage from './pages/EvaluationPage'
import ActionCascadePage from './pages/ActionCascadePage'
import PpSmartPage from './pages/PpSmartPage'
import AchievementsPage from './pages/AchievementsPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'
import Onboarding from './components/Onboarding'

const ONBOARDING_KEY = 'tyzhmanager_onboarding_done'

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Проверяем: первый ли это запуск?
  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) {
      setShowOnboarding(true)
    }
  }, [])

  // Завершение онбординга
  function handleOnboardingComplete() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  return (
    <>
      {/* Онбординг — показывается ОДИН раз при первом запуске */}
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      <BrowserRouter>
        <Routes>
          {/* Все страницы внутри общего каркаса с сайдбаром */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<DailyPage />} />
            <Route path="/strategy" element={<StrategyPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/cascade" element={<ActionCascadePage />} />
            <Route path="/pp-smart" element={<PpSmartPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}