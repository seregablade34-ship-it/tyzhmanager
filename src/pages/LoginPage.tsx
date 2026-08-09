// ==========================================
// СТРАНИЦА ВХОДА / РЕГИСТРАЦИИ /
// Восстановление пароля + OAuth (Яндекс, ВК)
// ==========================================
import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onLogin: () => void
}

type Mode = 'login' | 'register' | 'reset'

// ─── OAuth ───
const REDIRECT_URI = window.location.origin + '/auth/callback'

const YANDEX_URL = 'https://oauth.yandex.ru/authorize?' + new URLSearchParams({
  response_type: 'code',
  client_id: 'd251a207858f4689b56bb1ad417798c8',
  redirect_uri: REDIRECT_URI,
  state: 'yandex',
}).toString()

// ─── PKCE helpers для VK ID ───
function generateCodeVerifier(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export default function LoginPage({ onLogin }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() =>
    localStorage.getItem('tyzhmanager_remember') === 'true'
  )
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(newMode: Mode) {
    setMode(newMode)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        })
        if (error) throw error
        setSuccess('Письмо для восстановления отправлено на ' + email)
        setLoading(false)
        return
      }

      if (mode === 'register') {
        if (!agreeTerms) {
          setError('Необходимо согласие на обработку персональных данных')
          setLoading(false)
          return
        }
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }

      if (rememberMe) {
        localStorage.setItem('tyzhmanager_remember', 'true')
      } else {
        localStorage.removeItem('tyzhmanager_remember')
      }
      onLogin()
    } catch (err: any) {
      const msg = err.message || 'Произошла ошибка'
      if (msg.includes('Invalid login credentials')) {
        setError('Неверный email или пароль')
      } else if (msg.includes('already registered')) {
        setError('Этот email уже зарегистрирован. Войдите!')
      } else if (msg.includes('Password should be')) {
        setError('Пароль должен быть минимум 6 символов')
      } else if (msg.includes('rate limit')) {
        setError('Слишком много попыток. Подождите немного')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── OAuth ───
  async function handleOAuth(provider: 'yandex' | 'vk') {
    if (provider === 'yandex') {
      window.location.href = YANDEX_URL
    } else {
      // VK ID — нужен PKCE
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      localStorage.setItem('vk_code_verifier', codeVerifier)

      const vkUrl = 'https://id.vk.com/authorize?' + new URLSearchParams({
        response_type: 'code',
        client_id: '54713210',
        redirect_uri: REDIRECT_URI,
        state: 'vk',
        scope: 'email vkid.personal_info',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      }).toString()

      window.location.href = vkUrl
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

  const labelStyle = {
    display: 'block',
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 500,
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
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
          <h1 style={{ color: '#f8fafc', fontSize: 24, margin: 0, fontWeight: 700 }}>
            #тыжменеджер
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
            Дневник целей эффективного человека
          </p>
        </div>

        {mode === 'reset' ? (
          <>
            <h2 style={{ color: '#f8fafc', fontSize: 18, marginBottom: 8, textAlign: 'center' }}>
              🔑 Восстановление пароля
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
              Введите email — мы отправим ссылку для сброса пароля
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required style={inputStyle} />
              </div>
              {error && (
                <div style={{ background: '#7f1d1d', border: '1px solid #dc2626', borderRadius: 8,
                  padding: '10px 14px', marginBottom: 16, color: '#fecaca', fontSize: 14 }}>
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div style={{ background: '#14532d', border: '1px solid #22c55e', borderRadius: 8,
                  padding: '10px 14px', marginBottom: 16, color: '#bbf7d0', fontSize: 14 }}>
                  ✅ {success}
                </div>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px 0', background: loading ? '#1e40af' : '#3b82f6',
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer', marginBottom: 16,
              }}>
                {loading ? '⏳ Отправка...' : '📧 Отправить ссылку'}
              </button>
              <button type="button" onClick={() => switchMode('login')} style={{
                width: '100%', padding: '10px 0', background: 'transparent', color: '#94a3b8',
                border: '1px solid #334155', borderRadius: 8, fontSize: 14, cursor: 'pointer',
              }}>
                ← Вернуться ко входу
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Переключатель */}
            <div style={{ display: 'flex', background: '#0f172a', borderRadius: 8, padding: 4, marginBottom: 24 }}>
              <button onClick={() => switchMode('login')} style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                background: mode === 'login' ? '#3b82f6' : 'transparent',
                color: mode === 'login' ? '#fff' : '#94a3b8',
              }}>Вход</button>
              <button onClick={() => switchMode('register')} style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                background: mode === 'register' ? '#3b82f6' : 'transparent',
                color: mode === 'register' ? '#fff' : '#94a3b8',
              }}>Регистрация</button>
            </div>

            {/* OAuth */}
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => handleOAuth('yandex')} style={{
                width: '100%', padding: '12px 0', marginBottom: 10,
                background: '#000', color: '#fff', border: '1px solid #333',
                borderRadius: 8, fontSize: 15, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, transition: 'opacity 0.2s',
              }}>
                <span style={{ fontSize: 20 }}>Я</span>
                Продолжить с Яндекс ID
              </button>
              <button onClick={() => handleOAuth('vk')} style={{
                width: '100%', padding: '12px 0',
                background: '#0077FF', color: '#fff', border: 'none',
                borderRadius: 8, fontSize: 15, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, transition: 'opacity 0.2s',
              }}>
                <span style={{ fontSize: 18 }}>VK</span>
                Продолжить с ВКонтакте
              </button>
            </div>

            {/* Разделитель */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#334155' }} />
              <span style={{ color: '#64748b', fontSize: 13 }}>или по email</span>
              <div style={{ flex: 1, height: 1, background: '#334155' }} />
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Пароль</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Минимум 6 символов' : 'Ваш пароль'}
                    required minLength={6} style={{ ...inputStyle, paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8',
                  }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              {mode === 'login' && (
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  <button type="button" onClick={() => switchMode('reset')} style={{
                    background: 'none', border: 'none', color: '#60a5fa', fontSize: 13,
                    cursor: 'pointer', textDecoration: 'underline', padding: 0,
                  }}>Забыли пароль?</button>
                </div>
              )}
              {mode === 'register' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16,
                  cursor: 'pointer', gap: 10 }} onClick={() => setAgreeTerms(!agreeTerms)}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 2,
                    border: `2px solid ${agreeTerms ? '#3b82f6' : '#475569'}`,
                    background: agreeTerms ? '#3b82f6' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {agreeTerms && <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>✔</span>}
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.4 }}>
                    Я соглашаюсь с{' '}
                    <a href="/agreement" target="_blank" onClick={e => e.stopPropagation()}
                      style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                      пользовательским соглашением
                    </a>{' '}и даю согласие на{' '}
                    <a href="/privacy" target="_blank" onClick={e => e.stopPropagation()}
                      style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                      обработку персональных данных
                    </a>
                  </span>
                </div>
              )}
              {mode === 'login' && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24,
                  cursor: 'pointer' }} onClick={() => setRememberMe(!rememberMe)}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, marginRight: 10, flexShrink: 0,
                    border: `2px solid ${rememberMe ? '#3b82f6' : '#475569'}`,
                    background: rememberMe ? '#3b82f6' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {rememberMe && <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>✔</span>}
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: 14, userSelect: 'none' }}>
                    Запомнить меня
                  </span>
                </div>
              )}
              {error && (
                <div style={{ background: '#7f1d1d', border: '1px solid #dc2626', borderRadius: 8,
                  padding: '10px 14px', marginBottom: 16, color: '#fecaca', fontSize: 14 }}>
                  ⚠️ {error}
                </div>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px 0',
                background: loading ? '#1e40af' : '#3b82f6',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 16, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                transition: 'background 0.2s',
              }}>
                {loading ? '⏳ Загрузка...' : mode === 'register' ? '🚀 Зарегистрироваться' : '🔑 Войти'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}