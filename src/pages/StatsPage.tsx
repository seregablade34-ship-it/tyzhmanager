import { useState, useEffect } from 'react'
import {
  goalsTable, tasksTable, dailyEntriesTable,
  threePTable, ppSmartsTable, coachingTable,
  actionStepsTable, transfersTable, reflectionsTable,
} from '../api/helpers'

const TAG_LABELS: Record<string, string> = {
  focus: '🎯 Фокус',
  goal: '🏆 Цель',
  control: '📋 Контроль',
  routine: '🔄 Рутина',
  personal: '👤 Личное',
  meeting: '🤝 Встреча',
  letter: '✉️ Письмо',
}

const AI_PROMPT = `Проанализируй мою статистику из приложения "#тыжменеджер — дневник целей".

На основе данных:
1. Оцени мою продуктивность (% выполнения задач, динамика энергии).
2. Какие сферы целей доминируют, а какие провисают?
3. Какие теги задач я использую чаще — о чём это говорит?
4. Как часто я переношу задачи? Это проблема?
5. Какими инструментами я пользуюсь, а какие игнорирую?
6. Дай 3-5 конкретных рекомендаций для повышения эффективности.

Ответь структурированно, с эмодзи, кратко и по делу.`

interface Stats {
  energyMorning: { avg: number; count: number; min: number; max: number }
  energyEvening: { avg: number; count: number; min: number; max: number }
  totalTasks: number
  doneTasks: number
  tasksByTag: Record<string, number>
  totalGoals: number
  activeGoals: number
  completedGoals: number
  cancelledGoals: number
  goalsBySphere: Record<string, number>
  goalsByYear: Record<string, number>
  totalTransfers: number
  moveCount: number
  duplicateCount: number
  threePCount: number
  ppSmartCount: number
  coachingCount: number
  cascadeStepsCount: number
  reflectionsCount: number
  totalDays: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    try {
      const [
        goals, tasks, entries, transfers,
        threePs, ppSmarts, coachings, steps, reflections,
      ] = await Promise.all([
        goalsTable.getAll(),
        tasksTable.getAll(),
        dailyEntriesTable.getAll(),
        transfersTable.getAll(),
        threePTable.getAll(),
        ppSmartsTable.getAll(),
        coachingTable.getAll(),
        actionStepsTable.getAll(),
        reflectionsTable.getAll(),
      ])

      const calcEnergy = (arr: number[]) => arr.length > 0
        ? {
            avg: Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 10) / 10,
            count: arr.length,
            min: Math.min(...arr),
            max: Math.max(...arr),
          }
        : { avg: 0, count: 0, min: 0, max: 0 }

      const morningVals = entries.filter(e => e.energyLevel != null && e.energyLevel > 0).map(e => e.energyLevel || 0)
      const eveningVals = entries.filter(e => e.energyEvening != null && (e.energyEvening as number) > 0).map(e => (e.energyEvening as number) || 0)

      const tasksByTag: Record<string, number> = {}
      tasks.forEach(t => {
        const tag = t.tag || 'без тега'
        tasksByTag[tag] = (tasksByTag[tag] || 0) + 1
      })

      const goalsBySphere: Record<string, number> = {}
      goals.forEach(g => {
        const s = g.sphere || 'без сферы'
        goalsBySphere[s] = (goalsBySphere[s] || 0) + 1
      })

      const goalsByYear: Record<string, number> = {}
      goals.forEach(g => {
        const y = g.deadline ? g.deadline.split('-')[0] : 'без срока'
        goalsByYear[y] = (goalsByYear[y] || 0) + 1
      })

      setStats({
        energyMorning: calcEnergy(morningVals),
        energyEvening: calcEnergy(eveningVals),
        totalTasks: tasks.length,
        doneTasks: tasks.filter(t => t.status === 'done').length,
        tasksByTag,
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        cancelledGoals: goals.filter(g => g.status === 'cancelled').length,
        goalsBySphere,
        goalsByYear,
        totalTransfers: transfers.length,
        moveCount: transfers.filter(t => t.type === 'move').length,
        duplicateCount: transfers.filter(t => t.type === 'duplicate').length,
        threePCount: threePs.length,
        ppSmartCount: ppSmarts.length,
        coachingCount: coachings.filter(c => c.isCompleted).length,
        cascadeStepsCount: steps.length,
        reflectionsCount: reflections.length,
        totalDays: entries.length,
      })
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleDownload() {
    if (!stats) return
    const data = {
      exportDate: new Date().toISOString(),
      app: '#тыжменеджер — статистика',
      ...stats,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tyzhmanager-stats-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleCopyPrompt() {
    navigator.clipboard.writeText(AI_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-text-light py-20">
        ⏳ Загрузка статистики...
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-text-light py-20">
        ❌ Не удалось загрузить статистику
      </div>
    )
  }

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
    : 0

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">📊 Статистика</h1>
          <p className="text-text-light text-sm mt-1">
            Обзор вашей активности и прогресса
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg
                     hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer"
        >
          <span>📥</span>
          Скачать JSON
        </button>
      </div>

      {/* ═══ ЭНЕРГИЯ ═══ */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-text mb-4">⚡ Энергия</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg rounded-xl p-4">
            <p className="text-sm text-text-light mb-1">🌅 Утро (среднее)</p>
            <p className="text-3xl font-bold text-text">
              {stats.energyMorning.count > 0 ? stats.energyMorning.avg : '—'}
              <span className="text-sm font-normal text-text-light">/10</span>
            </p>
            {stats.energyMorning.count > 0 && (
              <p className="text-xs text-text-light mt-1">
                Мин: {stats.energyMorning.min} · Макс: {stats.energyMorning.max} · Замеров: {stats.energyMorning.count}
              </p>
            )}
          </div>
          <div className="bg-bg rounded-xl p-4">
            <p className="text-sm text-text-light mb-1">🌙 Вечер (среднее)</p>
            <p className="text-3xl font-bold text-text">
              {stats.energyEvening.count > 0 ? stats.energyEvening.avg : '—'}
              <span className="text-sm font-normal text-text-light">/10</span>
            </p>
            {stats.energyEvening.count > 0 && (
              <p className="text-xs text-text-light mt-1">
                Мин: {stats.energyEvening.min} · Макс: {stats.energyEvening.max} · Замеров: {stats.energyEvening.count}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ ЗАДАЧИ ═══ */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-text mb-4">📅 Задачи ежедневника</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-text">{stats.totalTasks}</p>
            <p className="text-xs text-text-light">Всего</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.doneTasks}</p>
            <p className="text-xs text-text-light">Выполнено</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{completionRate}%</p>
            <p className="text-xs text-text-light">Процент</p>
          </div>
        </div>

        {stats.totalTasks > 0 && (
          <div className="w-full bg-bg rounded-full h-2.5 mb-4">
            <div
              className="bg-green-500 rounded-full h-2.5 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        )}

        {Object.keys(stats.tasksByTag).length > 0 && (
          <div>
            <p className="text-sm font-medium text-text mb-2">По тегам:</p>
            <div className="space-y-1.5">
              {Object.entries(stats.tasksByTag)
                .sort(([, a], [, b]) => b - a)
                .map(([tag, count]) => (
                  <div key={tag} className="flex items-center justify-between px-3 py-2 bg-bg rounded-lg">
                    <span className="text-sm text-text">{TAG_LABELS[tag] || tag}</span>
                    <span className="text-sm font-semibold text-text">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ ЦЕЛИ ═══ */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-text mb-4">🎯 Мои цели</h2>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-bg rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-text">{stats.totalGoals}</p>
            <p className="text-xs text-text-light">Всего</p>
          </div>
          <div className="bg-bg rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.activeGoals}</p>
            <p className="text-xs text-text-light">Активных</p>
          </div>
          <div className="bg-bg rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.completedGoals}</p>
            <p className="text-xs text-text-light">Выполнено</p>
          </div>
          <div className="bg-bg rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.cancelledGoals}</p>
            <p className="text-xs text-text-light">Отменено</p>
          </div>
        </div>

        {Object.keys(stats.goalsByYear).length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-text mb-2">По годам:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.goalsByYear)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([year, count]) => (
                  <span key={year} className="px-3 py-1.5 bg-bg rounded-lg text-sm text-text">
                    {year}: <span className="font-semibold">{count}</span>
                  </span>
                ))}
            </div>
          </div>
        )}

        {Object.keys(stats.goalsBySphere).length > 0 && (
          <div>
            <p className="text-sm font-medium text-text mb-2">По сферам:</p>
            <div className="space-y-1.5">
              {Object.entries(stats.goalsBySphere)
                .sort(([, a], [, b]) => b - a)
                .map(([sphere, count]) => (
                  <div key={sphere} className="flex items-center justify-between px-3 py-2 bg-bg rounded-lg">
                    <span className="text-sm text-text">{sphere}</span>
                    <span className="text-sm font-semibold text-text">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ ПЕРЕНОСЫ ═══ */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-text mb-4">🔄 Переносы и дубли</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-text">{stats.totalTransfers}</p>
            <p className="text-xs text-text-light">Всего</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.moveCount}</p>
            <p className="text-xs text-text-light">Переносы</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.duplicateCount}</p>
            <p className="text-xs text-text-light">Дубли</p>
          </div>
        </div>
      </div>

      {/* ═══ ИНСТРУМЕНТЫ ═══ */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-text mb-4">🧰 Использование инструментов</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="text-xl font-bold text-text">{stats.threePCount}</p>
              <p className="text-xs text-text-light">Метод 3П</p>
            </div>
          </div>
          <div className="bg-bg rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🧩</span>
            <div>
              <p className="text-xl font-bold text-text">{stats.ppSmartCount}</p>
              <p className="text-xs text-text-light">PP SMART</p>
            </div>
          </div>
          <div className="bg-bg rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-xl font-bold text-text">{stats.coachingCount}</p>
              <p className="text-xs text-text-light">Самокоучинг</p>
            </div>
          </div>
          <div className="bg-bg rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🪜</span>
            <div>
              <p className="text-xl font-bold text-text">{stats.cascadeStepsCount}</p>
              <p className="text-xs text-text-light">Шаги каскада</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ОБЩЕЕ ═══ */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-text mb-4">📈 Общее</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-xl font-bold text-text">{stats.totalDays}</p>
              <p className="text-xs text-text-light">Дней заполнено</p>
            </div>
          </div>
          <div className="bg-bg rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-xl font-bold text-text">{stats.reflectionsCount}</p>
              <p className="text-xs text-text-light">Рефлексий</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ПРОМПТ ДЛЯ ИИ ═══ */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-text mb-3">🤖 Промпт для ИИ-анализа</h2>
        <p className="text-text-light text-sm mb-3">
          Скачайте JSON и загрузите в любой ИИ (ChatGPT, YandexGPT, Claude) вместе с этим промптом:
        </p>
        <div className="relative">
          <pre className="bg-bg border border-border rounded-xl p-4 text-sm text-text leading-relaxed whitespace-pre-wrap">
            {AI_PROMPT}
          </pre>
          <button
            onClick={handleCopyPrompt}
            className="absolute top-2 right-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg
                       text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer"
          >
            {copied ? '✅ Скопировано!' : '📋 Копировать'}
          </button>
        </div>
      </div>

      {/* Футер */}
      <div className="text-center text-sm text-text-light pt-2 pb-4">
        #тыжменеджер · Пилотная версия
      </div>
    </div>
  )
}