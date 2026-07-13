import { useState, useEffect, useMemo, useCallback } from 'react'
import { db } from '../db/database'
import { useCombo } from '../hooks/useCombo'
import { useAchievements } from '../hooks/useAchievements'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ─── Типы периодов ───
type Period = '7d' | '14d' | '30d' | 'all'

const PERIOD_DAYS: Record<Period, number | null> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  'all': null,
}

// ─── Цвета для графиков ───
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
const STATUS_COLORS = { active: '#3b82f6', completed: '#10b981', cancelled: '#ef4444' }

// ─── Конфигурация тегов (для статистики) ───
const TAG_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  'focus':    { label: 'Фокус',    icon: '🎯', color: '#ef4444' },
  'goal':     { label: 'Цель',     icon: '⭐', color: '#f59e0b' },
  'control':  { label: 'Контроль', icon: '📊', color: '#3b82f6' },
  'routine':  { label: 'Рутина',   icon: '🔁', color: '#6b7280' },
  'personal': { label: 'Личное',   icon: '💜', color: '#8b5cf6' },
  'meeting':  { label: 'Встреча',  icon: '🤝', color: '#10b981' },
  'letter':   { label: 'Операционная', icon: '✉️', color: '#06b6d4' },
}

// ─── Подсказки для блоков ───
const HINTS: Record<string, string> = {
  energy: 'Средний уровень энергии за выбранный период. Заполняется в Ежедневнике через шкалу 0-10.',
  tasks: 'Процент выполненных задач за период. Задачи создаются в Ежедневнике.',
  combo: 'Сколько дней подряд вы заполняете Ежедневник. Рекорд — максимальная серия.',
  goals: 'Общее количество целей на год. Актив — в работе, достиг — завершённые.',
  energyChart: 'График изменения вашей энергии по дням. Помогает видеть тренды и закономерности.',
  tasksChart: 'Зелёные столбцы — выполненные задачи, серые — общее количество за каждый день.',
  tagsPie: 'Распределение задач по тегам. Показывает на что уходит больше всего задач.',
  timeByTag: 'Сколько времени (в часах) запланировано на каждый тег за выбранный период.',
  strategyPie: 'Статусы стратегических целей на 5 лет: в работе, достигнуто или не выполнено.',
  goalsPie: 'Статусы годовых целей: в работе, достигнуто или отменено.',
  spheres: 'Распределение целей по сферам жизни. Показывает баланс между разными направлениями.',
  heatmap: 'Карта активности за 90 дней. Зелёный — день, когда вы работали в Ежедневнике.',
  productivity: 'Среднее количество задач в день, процент выполнения и самый продуктивный день недели.',
  achievements: 'Ваш прогресс в системе достижений: открытые бейджи, XP и текущий ранг.',
  tools: 'Сколько раз вы использовали каждый инструмент: PP SMART, каскад, Декарт и другие.',
  transfers: 'Статистика переносов и дублирований задач: сколько раз, по каким причинам.',
}

// ─── Форматирование минут ───
function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}ч ${m}м`
  if (h > 0) return `${h}ч`
  return `${m}м`
}

/// ─── Компонент подсказки (мини-окно) ───
function HintButton({ hintKey }: { hintKey: string }) {
  const [show, setShow] = useState(false)
  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold
                   hover:bg-primary/20 transition-colors cursor-pointer inline-flex items-center justify-center ml-2"
        title="Подсказка"
      >
        ?
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Затемнённый фон */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShow(false)}
          />

          {/* Окно подсказки */}
          <div className="relative bg-surface border border-border rounded-2xl shadow-2xl p-5 max-w-sm w-full z-10">
            {/* Крестик закрыть */}
            <button
              onClick={() => setShow(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-bg hover:bg-border
                         flex items-center justify-center text-text-light hover:text-text
                         transition-colors cursor-pointer text-sm"
            >
              ✕
            </button>

            {/* Иконка + текст */}
            <div className="flex items-start gap-3 pr-6">
              <span className="text-2xl flex-shrink-0">💡</span>
              <p className="text-sm text-text leading-relaxed">
                {HINTS[hintKey]}
              </p>
            </div>

            {/* Кнопка Продолжить */}
            <button
              onClick={() => setShow(false)}
              className="mt-4 w-full py-2.5 bg-primary text-white rounded-xl
                         font-medium text-sm hover:bg-primary-dark
                         transition-colors cursor-pointer"
            >
              Продолжить →
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>('7d')
  const { currentCombo, maxCombo } = useCombo()
  const { unlocked, allAchievements, rank, totalXp, xpProgress } = useAchievements()

  // ─── Данные из БД ───
  const [dailyEntries, setDailyEntries] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [strategies, setStrategies] = useState<any[]>([])
  const [ppSmarts, setPpSmarts] = useState<any[]>([])
  const [actionSteps, setActionSteps] = useState<any[]>([])
  const [descartesSquares, setDescartesSquares] = useState<any[]>([])
  const [eisenhowerItems, setEisenhowerItems] = useState<any[]>([])
  const [threePResults, setThreePResults] = useState<any[]>([])
  const [coachingSessions, setCoachingSessions] = useState<any[]>([])
  const [taskTransfers, setTaskTransfers] = useState<any[]>([])

  // ─── Загрузка ВСЕХ данных (авто-обновление) ───
  const loadAll = useCallback(async () => {
    const [de, t, g, s, pp, as2, ds, ei, tp, cs, tt] = await Promise.all([
      db.dailyEntries.toArray(),
      db.tasks.toArray(),
      db.goals.toArray(),
      db.strategies.toArray(),
      db.ppSmarts.toArray(),
      db.actionSteps.toArray(),
      db.descartesSquares.toArray(),
      db.eisenhowerItems.toArray(),
      db.threePResults.toArray(),
      db.coachingSessions.toArray(),
      db.taskTransfers.toArray(),
    ])
    setDailyEntries(de)
    setTasks(t)
    setGoals(g)
    setStrategies(s)
    setPpSmarts(pp)
    setActionSteps(as2)
    setDescartesSquares(ds)
    setEisenhowerItems(ei)
    setThreePResults(tp)
    setCoachingSessions(cs)
    setTaskTransfers(tt)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    const handleFocus = () => loadAll()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadAll])

  // ─── Фильтр по периоду ───
  function getDateThreshold(): string | null {
    const days = PERIOD_DAYS[period]
    if (!days) return null
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().split('T')[0]
  }

  const threshold = getDateThreshold()

  const filteredEntries = useMemo(() => {
    if (!threshold) return dailyEntries
    return dailyEntries.filter(e => e.date >= threshold)
  }, [dailyEntries, threshold])

  const filteredTasks = useMemo(() => {
    if (!threshold) return tasks
    return tasks.filter(t => t.date >= threshold)
  }, [tasks, threshold])

  // ─── 1. Средняя энергия ───
  const avgEnergy = useMemo(() => {
    const withEnergy = filteredEntries.filter(e => e.energyLevel > 0)
    if (withEnergy.length === 0) return 0
    const sum = withEnergy.reduce((acc: number, e: any) => acc + e.energyLevel, 0)
    return Math.round((sum / withEnergy.length) * 10) / 10
  }, [filteredEntries])

  // ─── 2. Задачи ───
  const tasksDone = useMemo(() => filteredTasks.filter((t: any) => t.status === 'done').length, [filteredTasks])
  const tasksTotal = filteredTasks.length
  const tasksPercent = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0

  // ─── 3. Стратегия по статусам ───
  const stratActive = strategies.filter((s: any) => (s.status || 'active') === 'active').length
  const stratCompleted = strategies.filter((s: any) => s.status === 'completed').length
  const stratCancelled = strategies.filter((s: any) => s.status === 'cancelled').length

  // ─── 4. Цели на год по статусам ───
  const goalsActive = goals.filter((g: any) => (g.status || 'active') === 'active').length
  const goalsCompleted = goals.filter((g: any) => g.status === 'completed').length
  const goalsCancelled = goals.filter((g: any) => g.status === 'cancelled').length

  // ─── 5. Достижения ───
  const unlockedCount = unlocked.length

  // ─── 6. График энергии (LineChart) ───
  const energyChartData = useMemo(() => {
    return filteredEntries
      .filter((e: any) => e.energyLevel > 0)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .map((e: any) => ({ date: e.date.slice(5), energy: e.energyLevel }))
  }, [filteredEntries])

  // ─── 7. Задачи по дням (BarChart) ───
  const tasksByDayData = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {}
    filteredTasks.forEach((t: any) => {
      if (!map[t.date]) map[t.date] = { done: 0, total: 0 }
      map[t.date].total++
      if (t.status === 'done') map[t.date].done++
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, val]) => ({ date: date.slice(5), done: val.done, total: val.total }))
  }, [filteredTasks])

  // ─── 8. Задачи по тегам (PieChart) ───
  const tagsPieData = useMemo(() => {
    const map: Record<string, number> = {}
    filteredTasks.forEach((t: any) => {
      const tag = t.tag || 'none'
      map[tag] = (map[tag] || 0) + 1
    })
    return Object.entries(map).map(([tag, count]) => {
      const cfg = TAG_CONFIG[tag]
      return {
        name: cfg ? `${cfg.icon} ${cfg.label}` : '📌 Без тега',
        value: count,
        color: cfg ? cfg.color : '#9ca3af',
      }
    })
  }, [filteredTasks])

  // ─── 9. Время по тегам (BarChart) ───
  const timeByTagData = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {}
    filteredTasks.forEach((t: any) => {
      const tag = t.tag || 'none'
      if (!map[tag]) map[tag] = { total: 0, done: 0 }
      const dur = t.duration ?? 60
      map[tag].total += dur
      if (t.status === 'done') map[tag].done += dur
    })
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([tag, val]) => {
        const cfg = TAG_CONFIG[tag]
        return {
          name: cfg ? cfg.label : 'Без тега',
          total: Math.round(val.total / 60 * 10) / 10,
          done: Math.round(val.done / 60 * 10) / 10,
          color: cfg ? cfg.color : '#9ca3af',
        }
      })
  }, [filteredTasks])

  // ─── 10. Стратегия PieChart ───
  const strategyPieData = [
    { name: 'В работе', value: stratActive, color: STATUS_COLORS.active },
    { name: 'Достигнуто', value: stratCompleted, color: STATUS_COLORS.completed },
    { name: 'Не выполнено', value: stratCancelled, color: STATUS_COLORS.cancelled },
  ].filter(d => d.value > 0)

  // ─── 11. Цели на год PieChart ───
  const goalsPieData = [
    { name: 'В работе', value: goalsActive, color: STATUS_COLORS.active },
    { name: 'Достигнуто', value: goalsCompleted, color: STATUS_COLORS.completed },
    { name: 'Отменено', value: goalsCancelled, color: STATUS_COLORS.cancelled },
  ].filter(d => d.value > 0)

  // ─── 12. Сферы жизни (PieChart) ───
  const spherePieData = useMemo(() => {
    const map: Record<string, number> = {}
    strategies.forEach((s: any) => {
      const sphere = s.sphere || 'Без сферы'
      map[sphere] = (map[sphere] || 0) + 1
    })
    goals.forEach((g: any) => {
      const sphere = g.sphere || 'Без сферы'
      map[sphere] = (map[sphere] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [goals, strategies])

  // ─── 13. Тепловая карта ───
  const heatmapData = useMemo(() => {
    const map: Record<string, boolean> = {}
    dailyEntries.forEach((e: any) => { map[e.date] = true })
    const cells: { date: string; active: boolean }[] = []
    const today = new Date()
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      cells.push({ date: key, active: !!map[key] })
    }
    return cells
  }, [dailyEntries])

  // ─── 14. Продуктивность ───
  const productivity = useMemo(() => {
    const daysWithTasks = new Set(filteredTasks.map((t: any) => t.date)).size
    const avgPerDay = daysWithTasks > 0 ? Math.round((tasksDone / daysWithTasks) * 10) / 10 : 0
    const dayMap: Record<string, number> = {}
    filteredTasks.filter((t: any) => t.status === 'done').forEach((t: any) => {
      const dayName = new Date(t.date).toLocaleDateString('ru-RU', { weekday: 'long' })
      dayMap[dayName] = (dayMap[dayName] || 0) + 1
    })
    const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]

    // Суммарное время
    const totalMinutes = filteredTasks.reduce((sum: number, t: any) => sum + (t.duration ?? 60), 0)
    const doneMinutes = filteredTasks.filter((t: any) => t.status === 'done')
      .reduce((sum: number, t: any) => sum + (t.duration ?? 60), 0)

    return {
      avgPerDay,
      percent: tasksPercent,
      bestDay: bestDay ? bestDay[0] : '—',
      totalTime: formatMinutes(totalMinutes),
      doneTime: formatMinutes(doneMinutes),
    }
  }, [filteredTasks, tasksDone, tasksPercent])

  // ─── 15. Статистика переносов ───
  const transferStats = useMemo(() => {
    const moves = taskTransfers.filter((t: any) => t.type === 'move').length
    const duplicates = taskTransfers.filter((t: any) => t.type === 'duplicate').length
    const byReason = {
      routine: taskTransfers.filter((t: any) => t.reason === 'routine').length,
      notFinished: taskTransfers.filter((t: any) => t.reason === 'not-finished').length,
      other: taskTransfers.filter((t: any) => t.reason === 'other').length,
    }
    return { total: taskTransfers.length, moves, duplicates, byReason }
  }, [taskTransfers])

  const transferPieData = useMemo(() => {
    return [
      { name: '🔄 Повтор', value: transferStats.byReason.routine, color: '#3b82f6' },
      { name: '⏰ Не успел', value: transferStats.byReason.notFinished, color: '#f59e0b' },
      { name: '📝 Другое', value: transferStats.byReason.other, color: '#8b5cf6' },
    ].filter(d => d.value > 0)
  }, [transferStats])

  // ─── Кастомный label для PieChart (цветной) ───
  const coloredLabel = ({ name, value, x, y, midAngle = 0, color, index = 0 }: any) => {
    const anchor = midAngle > 90 && midAngle < 270 ? 'end' : 'start'
    return (
      <text
        x={x} y={y}
        textAnchor={anchor}
        fontSize={13}
        fill={color || COLORS[index % COLORS.length]}
        fontWeight={700}
      >
        {`${name}: ${value}`}
      </text>
    )
  }

  // ═══════════════════════════════════════════
  // ═══            РЕНДЕР                   ═══
  // ═══════════════════════════════════════════
  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* === ЗАГОЛОВОК + ПЕРЕКЛЮЧАТЕЛЬ === */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">📊 Статистика</h1>
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          {(['7d', '14d', '30d', 'all'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                period === p ? 'bg-primary text-white' : 'text-text-light hover:bg-bg'
              }`}
            >
              {p === 'all' ? 'Всё' : p.replace('d', 'д')}
            </button>
          ))}
        </div>
      </div>

      {/* === 4 ВИДЖЕТА === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="flex items-center justify-center">
            <span className="text-2xl">⚡</span>
            <HintButton hintKey="energy" />
          </div>
          <p className="text-2xl font-bold text-text mt-1">{avgEnergy}</p>
          <p className="text-xs text-text-light">Средняя энергия</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="flex items-center justify-center">
            <span className="text-2xl">✅</span>
            <HintButton hintKey="tasks" />
          </div>
          <p className="text-2xl font-bold text-text mt-1">{tasksPercent}%</p>
          <p className="text-xs text-text-light">{tasksDone}/{tasksTotal} задач</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="flex items-center justify-center">
            <span className="text-2xl">🔥</span>
            <HintButton hintKey="combo" />
          </div>
          <p className="text-2xl font-bold text-text mt-1">{currentCombo}</p>
          <p className="text-xs text-text-light">Рекорд: {maxCombo}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="flex items-center justify-center">
            <span className="text-2xl">🎯</span>
            <HintButton hintKey="goals" />
          </div>
          <p className="text-2xl font-bold text-text mt-1">{goals.length + strategies.length}</p>
          <p className="text-xs text-text-light">Стратегия: {strategies.length} · Год: {goals.length}</p>
        </div>
      </div>

      {/* === ГРАФИК ЭНЕРГИИ === */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          📈 Уровень энергии
          <HintButton hintKey="energyChart" />
        </h2>
        {energyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={energyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Энергия" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-text-light text-center py-8">Нет данных за выбранный период</p>
        )}
      </div>

      {/* === ЗАДАЧИ ПО ДНЯМ === */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          ✅ Задачи по дням
          <HintButton hintKey="tasksChart" />
        </h2>
        {tasksByDayData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tasksByDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="done" fill="#10b981" name="Выполнено" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="#e5e7eb" name="Всего" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-text-light text-center py-8">Нет данных за выбранный период</p>
        )}
      </div>

      {/* === 🏷️ ЗАДАЧИ ПО ТЕГАМ + ⏱ ВРЕМЯ ПО ТЕГАМ === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Задачи по тегам */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text mb-4">
            🏷️ Задачи по тегам
            <HintButton hintKey="tagsPie" />
          </h2>
          {tagsPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={tagsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  label={coloredLabel}
                >
                  {tagsPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-light text-center py-8">Нет задач за выбранный период</p>
          )}
        </div>

        {/* Время по тегам */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text mb-4">
            ⏱ Время по тегам (часы)
            <HintButton hintKey="timeByTag" />
          </h2>
          {timeByTagData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={timeByTagData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" unit="ч" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
                  <Tooltip formatter={(val) => `${val}ч`} />
                  <Bar dataKey="done" fill="#10b981" name="Выполнено" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="total" fill="#e5e7eb" name="Запланировано" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-light justify-center">
                <span>🟢 Выполнено: {productivity.doneTime}</span>
                <span>⬜ Всего: {productivity.totalTime}</span>
              </div>
            </>
          ) : (
            <p className="text-text-light text-center py-8">Нет задач за выбранный период</p>
          )}
        </div>
      </div>

      {/* === СТРАТЕГИЯ + ГОДОВЫЕ ЦЕЛИ (2 PieChart) === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Стратегия 5 лет */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text mb-4">
            🎯 Стратегия 5 лет
            <HintButton hintKey="strategyPie" />
          </h2>
          {strategyPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={strategyPieData}
                  cx="50%"
                  cy="55%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  label={coloredLabel}
                >
                  {strategyPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-light text-center py-8">Нет стратегических целей</p>
          )}
        </div>

        {/* Цели на год */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text mb-4">
            📋 Цели на год
            <HintButton hintKey="goalsPie" />
          </h2>
          {goalsPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={goalsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  label={coloredLabel}
                >
                  {goalsPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-light text-center py-8">Нет годовых целей</p>
          )}
        </div>
      </div>

      {/* === СФЕРЫ ЖИЗНИ === */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          🌐 Сферы жизни (все цели)
          <HintButton hintKey="spheres" />
        </h2>
        {spherePieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spherePieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                label={({ name, value, x, y, midAngle = 0, index = 0 }) => {
                  const anchor = midAngle > 90 && midAngle < 270 ? 'end' : 'start'
                  return (
                    <text x={x} y={y} textAnchor={anchor} fontSize={13} fill={COLORS[index % COLORS.length]} fontWeight={700}>
                      {`${name}: ${value}`}
                    </text>
                  )
                }}
              >
                {spherePieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-text-light text-center py-8">Нет целей</p>
        )}
      </div>

      {/* === ТЕПЛОВАЯ КАРТА === */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          📅 Активность (90 дней)
          <HintButton hintKey="heatmap" />
        </h2>
        <div className="flex flex-wrap gap-1">
          {heatmapData.map((cell, i) => (
            <div
              key={i}
              title={cell.date}
              className={`w-3 h-3 rounded-sm ${cell.active ? 'bg-green-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-text-light">
          <div className="w-3 h-3 rounded-sm bg-gray-200" /> Пусто
          <div className="w-3 h-3 rounded-sm bg-green-500 ml-2" /> Заполнено
        </div>
      </div>

      {/* === ПРОДУКТИВНОСТЬ + ДОСТИЖЕНИЯ === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text mb-4">
            📝 Продуктивность
            <HintButton hintKey="productivity" />
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-light">Среднее задач/день</span>
              <span className="font-semibold text-text">{productivity.avgPerDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">% выполнения</span>
              <span className="font-semibold text-text">{productivity.percent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Лучший день</span>
              <span className="font-semibold text-text capitalize">{productivity.bestDay}</span>
            </div>
            <div className="border-t border-border pt-3 mt-1">
              <div className="flex justify-between">
                <span className="text-text-light">⏱ Выполнено</span>
                <span className="font-semibold text-green-600">{productivity.doneTime}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-text-light">⏱ Запланировано</span>
                <span className="font-semibold text-text">{productivity.totalTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text mb-4">
            🏅 Достижения
            <HintButton hintKey="achievements" />
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-light">Открыто</span>
              <span className="font-semibold text-text">{unlockedCount}/{allAchievements.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Очки опыта</span>
              <span className="font-semibold text-text">{totalXp} XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Ранг</span>
              <span className="font-semibold text-text">{rank.icon} {rank.title}</span>
            </div>
            <div className="w-full bg-bg rounded-full h-2 mt-1">
              <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${xpProgress.percent}%` }} />
            </div>
            <p className="text-xs text-text-light text-right">
              {xpProgress.current}/{xpProgress.needed} XP до следующего ранга
            </p>
          </div>
        </div>
      </div>

      {/* === 📦 ПЕРЕНОСЫ ЗАДАЧ === */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          📦 Переносы и дубли задач
          <HintButton hintKey="transfers" />
        </h2>
        {transferStats.total > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-light">Всего операций</span>
                <span className="font-bold text-text text-lg">{transferStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-light">📦 Переносов</span>
                <span className="font-semibold text-blue-600">{transferStats.moves}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-light">📋 Дублей</span>
                <span className="font-semibold text-green-600">{transferStats.duplicates}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs text-text-light mb-2 font-medium">По причинам:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-light">🔄 Повтор</span>
                    <span className="font-semibold text-text">{transferStats.byReason.routine}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-light">⏰ Не успел</span>
                    <span className="font-semibold text-text">{transferStats.byReason.notFinished}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-light">📝 Другое</span>
                    <span className="font-semibold text-text">{transferStats.byReason.other}</span>
                  </div>
                </div>
              </div>
            </div>

            {transferPieData.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={transferPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    dataKey="value"
                    label={coloredLabel}
                  >
                    {transferPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <p className="text-text-light text-center py-8">
            Пока нет переносов. Используйте 📦 в списке задач Ежедневника.
          </p>
        )}
      </div>

      {/* === ИНСТРУМЕНТЫ === */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          🧠 Использование инструментов
          <HintButton hintKey="tools" />
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-bg rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🧩</p>
            <p className="text-xl font-bold text-text">{ppSmarts.length}</p>
            <p className="text-xs text-text-light">PP SMART</p>
          </div>
          <div className="bg-bg rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🔗</p>
            <p className="text-xl font-bold text-text">{actionSteps.length}</p>
            <p className="text-xs text-text-light">Экшен-каскад шагов</p>
          </div>
          <div className="bg-bg rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🔲</p>
            <p className="text-xl font-bold text-text">{descartesSquares.length}</p>
            <p className="text-xs text-text-light">Квадрат Декарта</p>
          </div>
          <div className="bg-bg rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">📊</p>
            <p className="text-xl font-bold text-text">{eisenhowerItems.length}</p>
            <p className="text-xs text-text-light">Эйзенхауэр</p>
          </div>
          <div className="bg-bg rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🎯</p>
            <p className="text-xl font-bold text-text">{threePResults.length}</p>
            <p className="text-xs text-text-light">Метод 3П</p>
          </div>
          <div className="bg-bg rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">💬</p>
            <p className="text-xl font-bold text-text">{coachingSessions.length}</p>
            <p className="text-xs text-text-light">Мини-самокоучинг</p>
          </div>
        </div>
      </div>

    </div>
  )
}