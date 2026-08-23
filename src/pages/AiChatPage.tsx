import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const API_URL = 'https://api.tyzhmanager.ru/functions/v1/yandexgpt'

const TONE_OPTIONS = [
  { id: 'coach', emoji: '🎯', name: 'Коуч' },
  { id: 'analyst', emoji: '📊', name: 'Аналитик' },
  { id: 'sergeant', emoji: '🔥', name: 'Сержант' },
  { id: 'sage', emoji: '🧘', name: 'Мудрец' },
  { id: 'friend', emoji: '😄', name: 'Друг' },
  { id: 'mentor', emoji: '🎓', name: 'Ментор' },
  { id: 'visionary', emoji: '🚀', name: 'Визионер' },
]

const REPORT_OPTIONS = [
  { id: 'report_week', emoji: '📊', name: 'Неделя' },
  { id: 'report_month', emoji: '📈', name: 'Месяц' },
  { id: 'report_year', emoji: '📅', name: 'Год' },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState('')
  const [tone, setTone] = useState(() => localStorage.getItem('vector_tone') || 'coach')
  const [showTones, setShowTones] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [sessionType, setSessionType] = useState<'grow' | 'ppsmart' | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadHistory().then((msgs) => { checkMorningAdvice(msgs) })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    localStorage.setItem('vector_tone', tone)
  }, [tone])

  async function loadHistory(): Promise<Message[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return []
      const res = await fetch(
        'https://api.tyzhmanager.ru/rest/v1/ai_messages?select=id,role,content,created_at&order=created_at.asc&limit=50',
        { headers: { 'Authorization': 'Bearer ' + session.access_token, 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg0NzkzNjAwLCJleHAiOjIxMDAzNTUyMDB9.YN12BmGtEz18Whpwl3HaxrJhLJ1Z8sXMAEkXC-6wb-M' } }
      )
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) { setMessages(data); return data }
      }
    } catch (e) { console.error('History load error:', e) }
    finally { setHistoryLoading(false) }
    return []
  }

  async function checkMorningAdvice(msgs: Message[]) {
    const today = new Date().toISOString().split('T')[0]
    const lastDate = localStorage.getItem('vector_morning_date')
    if (lastDate === today) return
    const hasToday = msgs.some(m => m.created_at.startsWith(today))
    if (hasToday) { localStorage.setItem('vector_morning_date', today); return }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
        body: JSON.stringify({ type: 'morning_advice', tone }),
      })
      const data = await res.json()
      if (res.ok && data.message) {
        const aiMsg: Message = { id: 'morning-' + Date.now(), role: 'assistant', content: data.message, created_at: new Date().toISOString() }
        setMessages(prev => [...prev, aiMsg])
        localStorage.setItem('vector_morning_date', today)
      }
    } catch (e) { console.error('Morning error:', e) }
    finally { setLoading(false) }
  }

  // ===== ОТЧЁТЫ =====
  async function handleReport(reportType: string) {
    if (loading) return
    setShowReports(false)
    setError('')
    setLoading(true)

    const label = REPORT_OPTIONS.find(r => r.id === reportType)
    const userMsg: Message = {
      id: 'rpt-' + Date.now(), role: 'user',
      content: '📊 Запрос отчёта: ' + (label ? label.emoji + ' ' + label.name : reportType),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError('Не авторизован'); setLoading(false); return }
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
        body: JSON.stringify({ type: reportType, tone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Ошибка'); setLoading(false); return }
      const aiMsg: Message = { id: 'ai-' + Date.now(), role: 'assistant', content: data.message, created_at: new Date().toISOString() }
      setMessages(prev => [...prev, aiMsg])
    } catch (e: any) { setError('Ошибка сети: ' + (e.message || '')) }
    finally { setLoading(false); inputRef.current?.focus() }
  }

  // ===== СЕССИИ (GROW / PP SMART) =====
  function startSession(type: 'grow' | 'ppsmart') {
    setSessionType(type)
    setShowTones(false)
    setShowReports(false)
    const msg = type === 'grow' ? 'Начинаем GROW-коучинг' : 'Создаём PP SMART цель'
    handleSend(msg, type)
  }

  function endSession() {
    setSessionType(null)
  }

  // ===== ОТПРАВКА СООБЩЕНИЯ =====
  async function handleSend(customMessage?: string, overrideType?: string) {
    const text = (customMessage || input).trim()
    if (!text || loading) return
    setInput('')
    setError('')

    const userMsg: Message = { id: 'tmp-' + Date.now(), role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const sendType = overrideType || sessionType || undefined

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError('Не авторизован. Перезайдите.'); setLoading(false); return }

      const body: any = { message: text, tone }
      if (sendType) body.type = sendType

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'trial_expired') setError('⏰ Пробный период закончился. Оформите подписку.')
        else setError(data.error || 'Ошибка')
        setLoading(false); return
      }

      const aiMsg: Message = { id: 'ai-' + Date.now(), role: 'assistant', content: data.message, created_at: new Date().toISOString() }
      setMessages(prev => [...prev, aiMsg])

      // PP SMART сохранён автоматически
      if (data.ppsmartSaved) {
        const confirmMsg: Message = {
          id: 'confirm-' + Date.now(), role: 'assistant',
          content: '✅ PP SMART цель автоматически сохранена в раздел PP SMART! Ты можешь найти и отредактировать её там.',
          created_at: new Date().toISOString(),
        }
        setMessages(prev => [...prev, confirmMsg])
        setSessionType(null)
      }
    } catch (e: any) {
      setError('Ошибка сети: ' + (e.message || ''))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const currentTone = TONE_OPTIONS.find(t => t.id === tone) || TONE_OPTIONS[0]

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen max-w-3xl mx-auto">

      {/* === HEADER === */}
      <div className="px-4 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">🎯</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-text">Вектор</h1>
            <p className="text-xs text-text-light truncate">ИИ-ассистент #тыжменеджер</p>
          </div>
          <button onClick={() => { setShowReports(!showReports); setShowTones(false) }}
            className="px-2 py-1.5 bg-green-50 rounded-lg text-sm font-medium text-green-600 hover:bg-green-100 transition-colors cursor-pointer flex items-center gap-1">
            <span>📊</span><span className="hidden sm:inline">Отчёт</span><span className="text-[10px]">{showReports ? '▲' : '▼'}</span>
          </button>
          <button onClick={() => { setShowTones(!showTones); setShowReports(false) }}
            className="px-2 py-1.5 bg-primary/10 rounded-lg text-sm font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1">
            <span>{currentTone.emoji}</span><span className="hidden sm:inline">{currentTone.name}</span><span className="text-[10px]">{showTones ? '▲' : '▼'}</span>
          </button>
        </div>

        {showTones && (
          <div className="mt-3 flex flex-wrap gap-2">
            {TONE_OPTIONS.map((t) => (
              <button key={t.id} onClick={() => { setTone(t.id); setShowTones(false) }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer
                  ${tone === t.id ? 'bg-primary text-white shadow-md scale-105' : 'bg-surface-alt border border-border text-text-light hover:bg-primary/10 hover:text-primary'}`}
              >{t.emoji} {t.name}</button>
            ))}
          </div>
        )}

        {showReports && (
          <div className="mt-3 flex flex-wrap gap-2">
            {REPORT_OPTIONS.map((r) => (
              <button key={r.id} onClick={() => handleReport(r.id)} disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-all cursor-pointer disabled:opacity-50"
              >{r.emoji} {r.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* === SESSION BANNER === */}
      {sessionType && (
        <div className={`px-4 py-2 flex items-center justify-between ${sessionType === 'grow' ? 'bg-purple-50 border-b border-purple-200' : 'bg-amber-50 border-b border-amber-200'}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{sessionType === 'grow' ? '🧠' : '🎯'}</span>
            <span className={`text-sm font-semibold ${sessionType === 'grow' ? 'text-purple-700' : 'text-amber-700'}`}>
              {sessionType === 'grow' ? 'GROW-сессия' : 'PP SMART — создание цели'}
            </span>
          </div>
          <button onClick={endSession}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors
              ${sessionType === 'grow' ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
          >✕ Завершить</button>
        </div>
      )}

      {/* === MESSAGES === */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-bg">
        {historyLoading && (
          <div className="text-center text-text-light text-sm py-8">⏳ Загрузка истории...</div>
        )}

        {!historyLoading && messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-lg font-bold text-text mb-2">Привет! Я — Вектор</h2>
            <p className="text-sm text-text-light mb-2">Твой ИИ-ассистент для достижения целей.</p>
            <p className="text-xs text-text-light mb-6">
              Тон: <strong>{currentTone.emoji} {currentTone.name}</strong> — сменить можно в шапке ↗
            </p>

            {/* Сессии */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button onClick={() => startSession('grow')}
                className="px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-100 hover:shadow-md transition-all cursor-pointer">
                🧠 GROW-коучинг
              </button>
              <button onClick={() => startSession('ppsmart')}
                className="px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-100 hover:shadow-md transition-all cursor-pointer">
                🎯 Создать PP SMART
              </button>
            </div>

            {/* Быстрые вопросы */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {['📅 Помоги спланировать день', '💪 Мне нужна мотивация', '📊 Как отслеживать прогресс?', '🎯 Как ставить цели?'].map((q) => (
                <button key={q} onClick={() => handleSend(q)}
                  className="px-3 py-2 bg-surface border border-border rounded-xl text-sm text-text-light hover:bg-primary/5 hover:border-primary/30 hover:text-text transition-colors cursor-pointer"
                >{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-surface border border-border text-text rounded-bl-md'
            }`}>
              {msg.role === 'assistant' && <p className="text-xs font-semibold text-primary mb-1">Вектор 🎯</p>}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-white/60' : 'text-text-light'}`}>{formatTime(msg.created_at)}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <p className="text-xs font-semibold text-primary mb-1">Вектор 🎯</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">❌ {error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* === QUICK ACTIONS (above input, when no session) === */}
      {!sessionType && messages.length > 0 && (
        <div className="px-4 py-1.5 bg-surface border-t border-border flex gap-2 overflow-x-auto">
          <button onClick={() => startSession('grow')} disabled={loading}
            className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >🧠 GROW</button>
          <button onClick={() => startSession('ppsmart')} disabled={loading}
            className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >🎯 PP SMART</button>
        </div>
      )}

      {/* === INPUT === */}
      <div className="px-4 py-3 border-t border-border bg-surface">
        <div className="flex gap-2 items-end">
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={sessionType === 'grow' ? 'Отвечай на вопрос Вектора...' : sessionType === 'ppsmart' ? 'Ответь на вопрос для PP SMART...' : 'Напиши сообщение...'}
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg text-text placeholder-text-light/50
                       resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            style={{ maxHeight: '120px' }}
            onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' }}
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90
                       transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >{loading ? '⏳' : '➤'}</button>
        </div>
      </div>
    </div>
  )
}