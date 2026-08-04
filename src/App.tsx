// ==========================================
// ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ
// ==========================================

import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
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
import InstructionPage from './pages/InstructionPage'
import LoginPage from './pages/LoginPage'
import Onboarding from './components/Onboarding'

const ONBOARDING_KEY = 'tyzhmanager_onboarding_done'

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    async function checkAuth() {
      // Если нет флага "Запомнить меня" — выходим
      const remember = localStorage.getItem('tyzhmanager_remember')
      if (!remember) {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          await supabase.auth.signOut()
        }
        setIsLoggedIn(false)
        setLoading(false)
        return
      }

      // Проверяем сессию
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setIsLoggedIn(true)
      }
      setLoading(false)
    }

    checkAuth()

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Проверяем: первый ли это запуск?
  useEffect(() => {
    if (isLoggedIn) {
      const done = localStorage.getItem(ONBOARDING_KEY)
      if (!done) {
        setShowOnboarding(true)
      }
    }
  }, [isLoggedIn])

  // Завершение онбординга
  function handleOnboardingComplete() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  // Экран загрузки
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#94a3b8',
        fontSize: 18,
      }}>
        ⏳ Загрузка...
      </div>
    )
  }

  // Не авторизован → LoginPage
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
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
            <Route path="/instruction" element={<InstructionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}