import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase автоматически обрабатывает токен из URL
    // и создаёт сессию при переходе по ссылке из письма
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSessionReady(true)
        }
      }
    )

    // Проверяем, может сессия уже есть
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов')
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Ошибка при смене пароля')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f8fafc',
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: 16,
        padding: 40,
        width: 400,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        border: '1px solid #334155',
      }}>
        {/* Логотип */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
          <h1 style={{ color: '#f8fafc', fontSize: 22, margin: 0 }}>
            Новый пароль
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>
            #тыжменеджер
          </p>
        </div>

        {/* Успех */}
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#f8fafc', fontSize: 18, marginBottom: 8 }}>
              Пароль изменён!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
              Теперь вы можете войти с новым паролем
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: '#3b82f6',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              🚀 Перейти ко входу
            </a>
          </div>
        ) : !sessionReady ? (
          /* Ожидание сессии */
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>
              Проверяем ссылку восстановления...
            </p>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 12 }}>
              Если ничего не происходит —{' '}
              <a href="/" style={{ color: '#60a5fa' }}>вернитесь на страницу входа</a>
              {' '}и запросите новую ссылку
            </p>
          </div>
        ) : (
          /* Форма нового пароля */
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', color: '#cbd5e1',
                fontSize: 14, marginBottom: 6, fontWeight: 500,
              }}>
                Новый пароль
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 18,
                    padding: 4, color: '#94a3b8',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', color: '#cbd5e1',
                fontSize: 14, marginBottom: 6, fontWeight: 500,
              }}>
                Повторите пароль
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ещё раз"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{
                background: '#7f1d1d', border: '1px solid #dc2626',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#fecaca', fontSize: 14,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px 0',
                background: loading ? '#1e40af' : '#3b82f6',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 16, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? '⏳ Сохранение...' : '💾 Сохранить пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}