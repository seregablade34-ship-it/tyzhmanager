import { useState, useEffect } from 'react'
import { db } from '../db/database'

type ThemeMode = 'light' | 'dark' | 'system'

export default function SettingsPage() {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('tyzhmanager_username') || ''
  })
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('tyzhmanager_theme') as ThemeMode) || 'system'
  })
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('tyzhmanager_notifications') !== 'false'
  })
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // ─── Применение темы ───
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    localStorage.setItem('tyzhmanager_theme', theme)
  }, [theme])

  // ─── Слушатель системной темы ───
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  // ─── Сохранить имя ───
  function handleSaveName() {
    localStorage.setItem('tyzhmanager_username', userName.trim())
    showStatus('✅ Имя сохранено!')
  }

  // ─── Переключение уведомлений ───
  function handleToggleNotifications() {
    const newValue = !notifications
    setNotifications(newValue)
    localStorage.setItem('tyzhmanager_notifications', String(newValue))
    showStatus(newValue ? '🔔 Уведомления включены' : '🔕 Уведомления отключены')
  }

  // ─── Статус-сообщение ───
  function showStatus(msg: string) {
    setStatusMessage(msg)
    setTimeout(() => setStatusMessage(''), 3000)
  }

  // ─── Экспорт данных ───
  async function handleExport() {
    try {
      showStatus('⏳ Экспортируем...')

      const data: Record<string, any> = {}
      const tables = [
        'dailyEntries', 'tasks', 'goals', 'strategies',
        'ppSmarts', 'actionSteps', 'descartesSquares',
        'eisenhowerItems', 'threePResults', 'coachingSessions',
        'achievements', 'combos',
      ]

      for (const table of tables) {
        data[table] = await (db as any)[table].toArray()
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

  // ─── Импорт данных ───
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      showStatus('⏳ Импортируем...')
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data._version) {
        showStatus('❌ Неверный формат файла')
        return
      }

      const tables = [
        'dailyEntries', 'tasks', 'goals', 'strategies',
        'ppSmarts', 'actionSteps', 'descartesSquares',
        'eisenhowerItems', 'threePResults', 'coachingSessions',
        'achievements', 'combos',
      ]

      for (const table of tables) {
        if (data[table] && Array.isArray(data[table])) {
          await (db as any)[table].clear()
          await (db as any)[table].bulkAdd(data[table])
        }
      }

      if (data._localStorage) {
        if (data._localStorage.tyzhmanager_username) {
          localStorage.setItem('tyzhmanager_username', data._localStorage.tyzhmanager_username)
          setUserName(data._localStorage.tyzhmanager_username)
        }
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

  // ─── Очистка данных ───
  async function handleReset() {
    try {
      const tables = [
        'dailyEntries', 'tasks', 'goals', 'strategies',
        'ppSmarts', 'actionSteps', 'descartesSquares',
        'eisenhowerItems', 'threePResults', 'coachingSessions',
        'achievements', 'combos',
      ]

      for (const table of tables) {
        await (db as any)[table].clear()
      }

      localStorage.removeItem('tyzhmanager_username')
      localStorage.removeItem('tyzhmanager_theme')
      localStorage.removeItem('tyzhmanager_notifications')
      setUserName('')
      setTheme('system')
      setNotifications(true)
      setShowResetConfirm(false)
      showStatus('✅ Все данные удалены. Обновите страницу.')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text mb-6">⚙️ Настройки</h1>

      {/* Статус-сообщение */}
      {statusMessage && (
        <div className="mb-4 px-4 py-3 bg-primary/10 text-primary rounded-lg text-center font-medium text-sm">
          {statusMessage}
        </div>
      )}

      {/* Имя пользователя */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">👤 Ваше имя</h2>
        <p className="text-sm text-text-light mb-3">
          Введите ваше имя — оно будет отображаться в приложении
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Как вас зовут?"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-text
                       placeholder-text-light/50 focus:outline-none focus:ring-2
                       focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <button
            onClick={handleSaveName}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark
                       transition-colors cursor-pointer font-medium"
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* Тема */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">🎨 Тема оформления</h2>
        <p className="text-sm text-text-light mb-4">
          Выберите тему интерфейса
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg
                       transition-colors cursor-pointer border ${
              theme === 'light'
                ? 'bg-primary/10 border-primary text-primary font-semibold'
                : 'bg-bg border-border text-text-light hover:bg-surface'
            }`}
          >
            <span className="text-2xl">☀️</span>
            <span className="text-sm">Светлая</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg
                       transition-colors cursor-pointer border ${
              theme === 'dark'
                ? 'bg-primary/10 border-primary text-primary font-semibold'
                : 'bg-bg border-border text-text-light hover:bg-surface'
            }`}
          >
            <span className="text-2xl">🌙</span>
            <span className="text-sm">Тёмная</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg
                       transition-colors cursor-pointer border ${
              theme === 'system'
                ? 'bg-primary/10 border-primary text-primary font-semibold'
                : 'bg-bg border-border text-text-light hover:bg-surface'
            }`}
          >
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
          <button
            onClick={handleToggleNotifications}
            className={`w-14 h-8 rounded-full transition-colors cursor-pointer relative ${
              notifications ? 'bg-primary' : 'bg-border'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                notifications ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
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
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white
                       rounded-lg hover:bg-primary-dark transition-colors cursor-pointer font-medium"
          >
            <span className="text-lg">📥</span>
            Скачать мои данные
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-bg border border-border
                            rounded-lg hover:bg-surface transition-colors cursor-pointer font-medium text-text">
            <span className="text-lg">📤</span>
            Загрузить данные
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Очистка данных */}
      <div className="bg-surface border border-danger/20 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">🗑️ Очистка данных</h2>
        <p className="text-sm text-text-light mb-4">
          Удалить все данные приложения. Это действие нельзя отменить!
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-bg border border-danger/30 text-danger rounded-lg
                       hover:bg-danger/10 transition-colors cursor-pointer font-medium"
          >
            Удалить все данные
          </button>
        ) : (
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-4">
            <p className="text-sm text-danger font-semibold mb-3">
              ⚠️ Вы уверены? Все цели, задачи, записи и достижения будут удалены!
            </p>
            <p className="text-xs text-text-light mb-4">
              Рекомендуем сначала скачать копию данных ☝️
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90
                           transition-colors cursor-pointer font-medium"
              >
                Да, удалить всё
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-bg border border-border text-text rounded-lg
                           hover:bg-surface transition-colors cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Версия */}
      <div className="text-center text-text-light text-sm">
        <p>Версия 1.0.0 • Пилот</p>
      </div>
    </div>
  )
}