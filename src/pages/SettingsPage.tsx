import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  dailyEntriesTable, tasksTable, goalsTable,
  ppSmartsTable, actionStepsTable,
  threePTable, coachingTable,
  transfersTable, reflectionsTable, evalTable, settingsTable,
} from '../api/helpers'

type ThemeMode = 'light' | 'dark' | 'system'

const ALL_TABLES = [
  { name: 'dailyEntries', table: dailyEntriesTable },
  { name: 'tasks', table: tasksTable },
  { name: 'goals', table: goalsTable },
  { name: 'ppSmarts', table: ppSmartsTable },
  { name: 'actionSteps', table: actionStepsTable },
  { name: 'threePResults', table: threePTable },
  { name: 'coachingSessions', table: coachingTable },
  { name: 'taskTransfers', table: transfersTable },
  { name: 'goalReflections', table: reflectionsTable },
  { name: 'goalEvaluations', table: evalTable },
  { name: 'userSettings', table: settingsTable },
]

export default function SettingsPage() {
  // ─── Профиль ───
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)

  // ─── OAuth ───
  const [isOAuthUser, setIsOAuthUser] = useState(false)
  const [authProvider, setAuthProvider] = useState('')

  // ─── Смена пароля ───
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // ─── Настройки ───
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('tyzhmanager_theme') as ThemeMode) || 'system'
  })
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('tyzhmanager_notifications') !== 'false'
  })
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // ─── Загрузка профиля ───
  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || '')

      // Проверяем OAuth
      const meta = user.user_metadata || {}
      const isOAuth = !!meta.auth_provider
      setIsOAuthUser(isOAuth)
      setAuthProvider(meta.auth_provider || '')

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Приоритет: profile.display_name → metadata.full_name → пусто
        const name = profile.display_name || meta.full_name || ''
        // Не показываем email как имя
        setDisplayName(name.includes('@') ? '' : name)
        setBirthDate(profile.birth_date || '')
        setGender(profile.gender || '')
        setReferralCode(profile.referral_code || '')
      }
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  // ─── Сохранить профиль ───
  async function handleSaveProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: displayName.trim(),
          birth_date: birthDate || null,
          gender: gender || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
      localStorage.setItem('tyzhmanager_username', displayName.trim())
      showStatus('✅ Профиль сохранён!')
    } catch (err) {
      showStatus('❌ Ошибка сохранения профиля')
      console.error(err)
    }
  }

  // ─── Смена пароля ───
  async function handleChangePassword() {
    if (newPassword.length < 6) {
      showStatus('❌ Пароль должен быть минимум 6 символов')
      return
    }
    if (newPassword !== confirmPassword) {
      showStatus('❌ Пароли не совпадают')
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      showStatus('✅ Пароль изменён!')
    } catch (err: any) {
      showStatus(`❌ Ошибка: ${err.message}`)
      console.error(err)
    }
  }

  // ─── Реферальная ссылка ───
  function handleCopyReferral() {
    const link = `https://tyzhmanager.ru?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    showStatus('📋 Реферальная ссылка скопирована!')
  }

  // ─── Промокод ───
  async function handleActivatePromo() {
    if (!promoInput.trim()) {
      showStatus('❌ Введите промокод')
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase
        .from('user_profiles')
        .update({ promo_used: promoInput.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) throw error
      setPromoInput('')
      showStatus('✅ Промокод активирован!')
    } catch (err) {
      showStatus('❌ Ошибка активации промокода')
      console.error(err)
    }
  }

  // ─── Возраст ───
  function calculateAge(): string {
    if (!birthDate) return ''
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    const lastDigit = age % 10
    const lastTwo = age % 100
    let word = 'лет'
    if (lastTwo >= 11 && lastTwo <= 14) word = 'лет'
    else if (lastDigit === 1) word = 'год'
    else if (lastDigit >= 2 && lastDigit <= 4) word = 'года'
    return `${age} ${word}`
  }

  // ─── Тема ───
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else if (theme === 'light') root.classList.remove('dark')
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }
    localStorage.setItem('tyzhmanager_theme', theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  function handleToggleNotifications() {
    const newValue = !notifications
    setNotifications(newValue)
    localStorage.setItem('tyzhmanager_notifications', String(newValue))
    showStatus(newValue ? '🔔 Уведомления включены' : '🔕 Уведомления отключены')
  }

  function showStatus(msg: string) {
    setStatusMessage(msg)
    setTimeout(() => setStatusMessage(''), 3000)
  }

  async function handleExport() {
    try {
      showStatus('⏳ Экспортируем...')
      const data: Record<string, any> = {}
      for (const { name, table } of ALL_TABLES) {
        try { data[name] = await table.getAll() } catch { data[name] = [] }
      }
      data._localStorage = {
        tyzhmanager_username: localStorage.getItem('tyzhmanager_username'),
        tyzhmanager_theme: localStorage.getItem('tyzhmanager_theme'),
        tyzhmanager_notifications: localStorage.getItem('tyzhmanager_notifications'),
      }
      data._exportDate = new Date().toISOString()
      data._version = '1.0.0'
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tyzhmanager-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showStatus('✅ Данные скачаны!')
    } catch (err) {
      showStatus('❌ Ошибка экспорта')
      console.error(err)
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      showStatus('⏳ Импортируем...')
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data._version) { showStatus('❌ Неверный формат файла'); return }
      for (const { name, table } of ALL_TABLES) {
        if (data[name] && Array.isArray(data[name])) {
          const existing = await table.getAll()
          for (const item of existing) { if (item.id) await table.remove(item.id) }
          for (const item of data[name]) { const { id, ...rest } = item; await table.create(rest) }
        }
      }
      if (data._localStorage) {
        if (data._localStorage.tyzhmanager_username)
          localStorage.setItem('tyzhmanager_username', data._localStorage.tyzhmanager_username)
        if (data._localStorage.tyzhmanager_theme) {
          localStorage.setItem('tyzhmanager_theme', data._localStorage.tyzhmanager_theme)
          setTheme(data._localStorage.tyzhmanager_theme as ThemeMode)
        }
        if (data._localStorage.tyzhmanager_notifications) {
          localStorage.setItem('tyzhmanager_notifications', data._localStorage.tyzhmanager_notifications)
          setNotifications(data._localStorage.tyzhmanager_notifications !== 'false')
        }
      }
      showStatus('✅ Данные восстановлены! Обновите страницу.')
    } catch (err) {
      showStatus('❌ Ошибка импорта')
      console.error(err)
    }
    e.target.value = ''
  }

  async function handleReset() {
    try {
      for (const { table } of ALL_TABLES) {
        try {
          const existing = await table.getAll()
          for (const item of existing) { if (item.id) await table.remove(item.id) }
        } catch { /* пусто */ }
      }
      localStorage.removeItem('tyzhmanager_username')
      localStorage.removeItem('tyzhmanager_theme')
      localStorage.removeItem('tyzhmanager_notifications')
      setTheme('system')
      setNotifications(true)
      setShowResetConfirm(false)
      showStatus('✅ Все данные удалены. Обновите страницу.')
    } catch (err) { console.error(err) }
  }

  if (profileLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-text-light">
        Загрузка профиля...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">👤 Профиль</h1>

      {statusMessage && (
        <div className="mb-4 px-4 py-3 bg-primary/10 text-primary rounded-lg text-center font-medium text-sm">
          {statusMessage}
        </div>
      )}

      {/* Email */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">📧 Email</h2>
        <p className="text-sm text-text-light mb-2">Ваш email для входа в систему</p>
        <div className="px-3 py-2 rounded-lg bg-bg border border-border text-text-light text-sm">
          {email}
        </div>
        {isOAuthUser && (
          <div className="mt-3 flex items-center gap-2 text-sm text-text-light">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs">
              {authProvider === 'yandex' ? '🟡 Яндекс ID' : '🔵 ВКонтакте'}
            </span>
            Вход через внешний аккаунт
          </div>
        )}
      </div>

      {/* Личные данные */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">📛 Личные данные</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-text mb-1">Имя</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Как вас зовут?"
            autoComplete="name"
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text
                       placeholder-text-light/50 focus:outline-none focus:ring-2
                       focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-text mb-1">
            Дата рождения {birthDate && <span className="text-text-light font-normal">({calculateAge()})</span>}
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text
                       focus:outline-none focus:ring-2 focus:ring-primary/30
                       focus:border-primary transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-text mb-2">Пол</label>
          <div className="flex gap-2">
            <button
              onClick={() => setGender('M')}
              className={`flex-1 py-2 rounded-lg border transition-colors cursor-pointer text-sm font-medium ${
                gender === 'M'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-bg border-border text-text-light hover:bg-surface'
              }`}
            >
              👨 Мужской
            </button>
            <button
              onClick={() => setGender('F')}
              className={`flex-1 py-2 rounded-lg border transition-colors cursor-pointer text-sm font-medium ${
                gender === 'F'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-bg border-border text-text-light hover:bg-surface'
              }`}
            >
              👩 Женский
            </button>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark
                     transition-colors cursor-pointer font-medium"
        >
          💾 Сохранить профиль
        </button>
      </div>

      {/* Смена пароля — ТОЛЬКО для email-пользователей */}
      {!isOAuthUser && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">🔒 Смена пароля</h2>

          <div className="mb-3">
            <label className="block text-sm font-medium text-text mb-1">Новый пароль</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
                className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-bg text-text
                           placeholder-text-light/50 focus:outline-none focus:ring-2
                           focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-light
                           hover:text-text cursor-pointer p-1"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-1">Повторите пароль</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите новый пароль"
              autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text
                         placeholder-text-light/50 focus:outline-none focus:ring-2
                         focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-danger mb-3">❌ Пароли не совпадают</p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={!newPassword || !confirmPassword}
            className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark
                       transition-colors cursor-pointer font-medium disabled:opacity-50
                       disabled:cursor-not-allowed"
          >
            🔑 Изменить пароль
          </button>
        </div>
      )}

      {/* Реферальная ссылка */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">🔗 Реферальная ссылка</h2>
        <p className="text-sm text-text-light mb-3">
          Поделитесь ссылкой с друзьями — пригласите их в #тыжменеджер
        </p>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm truncate">
            https://tyzhmanager.ru?ref={referralCode}
          </div>
          <button
            onClick={handleCopyReferral}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark
                       transition-colors cursor-pointer font-medium text-sm"
          >
            📋 Копировать
          </button>
        </div>
      </div>

      {/* Промокод */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">🏷️ Промокод</h2>
        <p className="text-sm text-text-light mb-3">
          Введите промокод для активации дополнительных возможностей
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="Введите промокод"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-text
                       placeholder-text-light/50 focus:outline-none focus:ring-2
                       focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <button
            onClick={handleActivatePromo}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark
                       transition-colors cursor-pointer font-medium text-sm"
          >
            Активировать
          </button>
        </div>
      </div>

      {/* ═══ НАСТРОЙКИ ═══ */}
      <div className="mt-10 mb-6">
        <h2 className="text-xl font-bold text-text">⚙️ Настройки</h2>
      </div>

      {/* Тема */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">🎨 Тема оформления</h2>
        <p className="text-sm text-text-light mb-4">Выберите тему интерфейса</p>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors cursor-pointer border ${
              theme === 'light' ? 'bg-primary/10 border-primary text-primary font-semibold'
                : 'bg-bg border-border text-text-light hover:bg-surface'}`}>
            <span className="text-2xl">☀️</span>
            <span className="text-sm">Светлая</span>
          </button>
          <button onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors cursor-pointer border ${
              theme === 'dark' ? 'bg-primary/10 border-primary text-primary font-semibold'
                : 'bg-bg border-border text-text-light hover:bg-surface'}`}>
            <span className="text-2xl">🌙</span>
            <span className="text-sm">Тёмная</span>
          </button>
          <button onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors cursor-pointer border ${
              theme === 'system' ? 'bg-primary/10 border-primary text-primary font-semibold'
                : 'bg-bg border-border text-text-light hover:bg-surface'}`}>
            <span className="text-2xl">💻</span>
            <span className="text-sm">Системная</span>
          </button>
        </div>
      </div>

      {/* Уведомления */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">🔔 Уведомления</h2>
            <p className="text-sm text-text-light mt-1">
              {notifications ? 'Уведомления включены' : 'Уведомления отключены'}
            </p>
          </div>
          <button onClick={handleToggleNotifications}
            className={`w-14 h-8 rounded-full transition-colors cursor-pointer relative ${
              notifications ? 'bg-primary' : 'bg-border'}`}>
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
              notifications ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Экспорт / Импорт */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">💾 Мои данные</h2>
        <p className="text-sm text-text-light mb-4">
          Сохраните копию всех данных на компьютер или восстановите из файла
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white
                       rounded-lg hover:bg-primary-dark transition-colors cursor-pointer font-medium">
            <span className="text-lg">📥</span> Скачать мои данные
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-bg border border-border
                            rounded-lg hover:bg-surface transition-colors cursor-pointer font-medium text-text">
            <span className="text-lg">📤</span> Загрузить данные
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Очистка */}
      <div className="bg-surface border border-danger/20 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">🗑️ Очистка данных</h2>
        <p className="text-sm text-text-light mb-4">
          Удалить все данные приложения. Это действие нельзя отменить!
        </p>
        {!showResetConfirm ? (
          <button onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-bg border border-danger/30 text-danger rounded-lg
                       hover:bg-danger/10 transition-colors cursor-pointer font-medium">
            Удалить все данные
          </button>
        ) : (
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-4">
            <p className="text-sm text-danger font-semibold mb-3">
              ⚠️ Вы уверены? Все цели, задачи, записи и достижения будут удалены!
            </p>
            <p className="text-xs text-text-light mb-4">Рекомендуем сначала скачать копию данных ☝️</p>
            <div className="flex gap-2">
              <button onClick={handleReset}
                className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90
                           transition-colors cursor-pointer font-medium">
                Да, удалить всё
              </button>
              <button onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-bg border border-border text-text rounded-lg
                           hover:bg-surface transition-colors cursor-pointer">
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-text-light text-sm">
        <p>Версия 1.0.0 • Пилот</p>
      </div>
    </div>
  )
}