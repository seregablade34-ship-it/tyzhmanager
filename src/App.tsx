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
import ResetPasswordPage from './pages/ResetPasswordPage'
import OAuthCallback from './pages/OAuthCallback'
import Onboarding from './components/Onboarding'

const ONBOARDING_KEY = 'tyzhmanager_onboarding_done'

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hash = window.location.hash
    const isRecoveryLink = hash.includes('type=recovery')

    if (isRecoveryLink) {
      setIsRecovery(true)
      setLoading(false)
      return
    }

    async function checkAuth() {
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

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setIsLoggedIn(true)
      }
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovery(true)
          return
        }
        setIsLoggedIn(!!session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      const done = localStorage.getItem(ONBOARDING_KEY)
      if (!done) {
        setShowOnboarding(true)
      }
    }
  }, [isLoggedIn])

  function handleOnboardingComplete() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  // ─── OAuth Callback — проверяем И pathname И параметры URL ───
  const _sp = new URLSearchParams(window.location.search)
  const isOAuthCallback =
    window.location.pathname === '/auth/callback' ||
    (_sp.has('code') && _sp.has('state'))

  console.log('[App] pathname:', window.location.pathname, 'isOAuth:', isOAuthCallback)

  if (isOAuthCallback) {
    console.log('[App] >>> Rendering OAuthCallback')
    return <OAuthCallback />
  }

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

  if (isRecovery) {
    return <ResetPasswordPage />
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <>
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      <BrowserRouter>
        <Routes>
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