import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getToday,
  getPrevDay,
  getNextDay,
  isToday,
  isFuture,
  formatDateHuman,
} from '../utils/dateHelpers'
import { useDailyEntry } from '../hooks/useDailyEntry'
import { getDailyQuote } from '../utils/quotes'
import { db } from '../db/database'
import type { Goal, TransferReason } from '../types'
import EnergyScale from '../components/EnergyScale'
import MorningBlock from '../components/MorningBlock'
import TaskList from '../components/TaskList'
import EveningBlock from '../components/EveningBlock'
import CalendarPopup from '../components/CalendarPopup'

// ─── Фразы приветствия ───
const GREETINGS = [
  'Действуй, соня. Мир ждёт.',
  'Шаг вперёд — ты крут!',
  'План есть? Погнали!',
  'Цель близко. Не сбавляй.',
  'Будь сегодня рок-звездой.',
  'Иди и врывайся!',
  'Ты сильнее кофеина.',
  'Преврати «надо» в «хочу».',
  'Сфокусируйся. Твоя цель не убежит, но она любит прятаться за словом «Завтра».',
  'Этот день — чистый лист. Напиши на нём что-то круче списка покупок.',
  'Ты уже сделал главное — открыл глаза. Осталось сделать крутое дело.',
  'Не думай о цели как о горе. Думай как о вкусном пироге — ешь по кусочку.',
  'Ты здесь. Значит, на шаг впереди тех, кто даже не открыл дневник.',
  'Помни: даже самая длинная дорога начинается с шага... или с пинка. Вот тебе пинок.',
  'Ставь цели так, будто через год будешь давать интервью.',
  'Все гениальное просто. Все сложное — это просто ты нашёл отмазку.',
  'Ньютон открыл закон, когда ему упало на голову. Тебе ничего падать не будет — просто начинай.',
  'Вчера ты хотел стать лучше. Сегодня есть шанс не облажаться. В бой!',
  'У тебя всё получится. Дело не в завтраке, дело в тебе.',
  'Ты — автор своей истории. Пиши главу «Успех», а не «Ожидание у моря погоды».',
]

// ─── Фразы при пропуске ≥2 дней ───
const COMEBACK_PHRASES = [
  'О, ты вернулся! А мы уж думали, тебя похитили инопланетяне...',
  'Привет, беглец! Диван без тебя скучал, а цели — нет.',
  'Нарушитель режима задержан! Садись, пиши цели.',
  'Ну что, нагулялся? Все «завтра» уже закончились.',
  'Ты пропал, я волновался. А потом понял — ты просто боялся напоминаний.',
  'Удрал? Вернулся? Работай!',
  'Скучал? Я нет. Погнали.',
  'Твой отпуск отменяется. Задачи ждут.',
  'Здесь твоё место. В бой, чемпион!',
  'Смотрю, тебе надоело быть «тем, кто всё бросает». Рад, что одумался.',
  'По статистике, ты должен был сдаться. Но ты здесь. Нарушаешь статистику!',
  'Ты думал, если не заходить, цели исчезнут? Нет, дорогой. Они терпеливые.',
  'Опять ты! Я уже начал забывать твой пароль. Давай, не позорь мою память!',
  'Твой внутренний прокрастинатор плачет. Ты его переиграл.',
  'А я знал, что ты вернёшься! Не потому что я оптимист, а потому что ты не умеешь сидеть без дела.',
]

// ─── Стабильная фраза на день ───
function getDailyPhrase(phrases: string[]): string {
  const today = new Date().toISOString().split('T')[0]
  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i)
    hash |= 0
  }
  return phrases[Math.abs(hash) % phrases.length]
}

// ─── Даты текущей недели (Пн-Вс) ───
function getWeekDates(): string[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function DailyPage() {
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [goals, setGoals] = useState<Goal[]>([])
  const [showCalendar, setShowCalendar] = useState(false)

  // Свёрнутые блоки
  const [greetingOpen, setGreetingOpen] = useState(false)
  const [weekOpen, setWeekOpen] = useState(false)

  // Данные недели
  const [weekData, setWeekData] = useState<{ date: string; done: number; total: number }[]>([])
  const [daysSinceLastVisit, setDaysSinceLastVisit] = useState(0)

  const weekDates = useMemo(() => getWeekDates(), [])
  const todayStr = getToday()

  const {
    entry,
    tasks,
    isLoading,
    updateEnergy,
    updateIntention,
    updateGratitude,
    updatePriorities,
    updateWin,
    updateLesson,
    updateTomorrow,
    addTask,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskTag,
    updateTaskDuration,
    deleteTask,
    restoreTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useDailyEntry(selectedDate)

  // Загрузка целей для импорта
  useEffect(() => {
    db.goals.orderBy('order').toArray().then(setGoals).catch(console.error)
  }, [])

  // Загрузка данных недели + проверка последнего визита
  useEffect(() => {
    loadWeekData()
    checkLastVisit()
  }, [])

  // Перезагрузка недели при смене даты (задачи могли измениться)
  useEffect(() => {
    loadWeekData()
  }, [tasks])

  async function loadWeekData() {
    try {
      const allTasks = await db.tasks.toArray()
      const data = weekDates.map(date => {
        const dayTasks = allTasks.filter(t => t.date === date)
        const done = dayTasks.filter(t => t.status === 'done').length
        return { date, done, total: dayTasks.length }
      })
      setWeekData(data)
    } catch (error) {
      console.error('Ошибка загрузки недели:', error)
    }
  }

  function checkLastVisit() {
    const KEY = 'tyzhmanager_last_visit'
    const lastVisit = localStorage.getItem(KEY)
    const now = new Date()
    const todayISO = now.toISOString().split('T')[0]

    if (lastVisit && lastVisit !== todayISO) {
      const lastDate = new Date(lastVisit)
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays >= 2) {
        setDaysSinceLastVisit(diffDays)
        setGreetingOpen(true) // Автоматически раскрыть при камбэке
      }
    }

    localStorage.setItem(KEY, todayISO)
  }

  // Подготовка целей для TaskList
  const importGoals = goals
    .filter(g => g.status === 'active')
    .map(g => ({
      id: g.id!,
      title: g.title,
      sphere: g.sphere,
    }))

  function goToPrevDay() {
    setSelectedDate(prev => getPrevDay(prev))
  }

  function goToNextDay() {
    setSelectedDate(prev => getNextDay(prev))
  }

  function goToToday() {
    setSelectedDate(getToday())
  }

  function getDayLabel(): string {
    if (isToday(selectedDate)) return '📌 Сегодня'
    if (isFuture(selectedDate)) return '🔮 Будущий день'
    return '📖 Прошедший день'
  }

  // Перенос / дублирование задачи
  const handleTransferTask = useCallback(async (
    taskId: number,
    data: {
      toDate: string
      type: 'move' | 'duplicate'
      reason: TransferReason
      comment?: string
    }
  ) => {
    try {
      const task = await db.tasks.get(taskId)
      if (!task) return

      const now = new Date().toISOString()

      const newTask = {
        ...task,
        id: undefined,
        date: data.toDate,
        status: 'not-started' as const,
        subtasks: task.subtasks?.map(st => ({ ...st, isCompleted: false })) || [],
        createdAt: now,
        updatedAt: now,
      }
      await db.tasks.add(newTask)

      if (data.type === 'move') {
        await db.tasks.delete(taskId)
      }

      await db.taskTransfers.add({
        taskId,
        fromDate: selectedDate,
        toDate: data.toDate,
        type: data.type,
        reason: data.reason,
        comment: data.comment,
        createdAt: now,
      })

      setSelectedDate('')
      setTimeout(() => setSelectedDate(selectedDate), 50)

    } catch (error) {
      console.error('Ошибка переноса задачи:', error)
    }
  }, [selectedDate])

  // Фраза дня
  const phrase = daysSinceLastVisit >= 2
    ? getDailyPhrase(COMEBACK_PHRASES)
    : getDailyPhrase(GREETINGS)

  // Мини-иконки недели для свёрнутого вида
  function getWeekMiniIcons(): string {
    return weekDates.map(date => {
      const data = weekData.find(d => d.date === date)
      const hasTasks = (data?.total ?? 0) > 0
      const allDone = hasTasks && data!.done === data!.total

      if (date === todayStr) return '🔵'
      if (allDone) return '✅'
      if (hasTasks) return '🟡'
      if (date < todayStr) return '·'
      return '—'
    }).join(' ')
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  const quote = getDailyQuote()

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* ═══ БЛОК 1: ПРИВЕТСТВИЕ (свёрнуто по умолчанию) ═══ */}
      <div className={`rounded-xl mb-2 overflow-hidden transition-all ${
        daysSinceLastVisit >= 2
          ? 'bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200'
          : 'bg-surface border border-border'
      }`}>
        {/* Свёрнутая полоска */}
        <button
          onClick={() => setGreetingOpen(!greetingOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer
                     hover:bg-black/5 transition-colors"
        >
          <span className="text-sm text-text-light">
            {daysSinceLastVisit >= 2 ? '😤' : '👋'} Приветствие дня
          </span>
          <span className="text-xs text-text-light">{greetingOpen ? '▲' : '▼'}</span>
        </button>

        {/* Раскрытое содержимое */}
        {greetingOpen && (
          <div className="px-4 pb-4">
            {daysSinceLastVisit >= 2 && (
              <p className="text-xs font-medium text-orange-600 mb-1">
                Тебя не было {daysSinceLastVisit} {
                  daysSinceLastVisit >= 2 && daysSinceLastVisit <= 4 ? 'дня' : 'дней'
                }!
              </p>
            )}
            <p className="text-sm text-text italic leading-relaxed">
              «{phrase}»
            </p>
          </div>
        )}
      </div>

      {/* ═══ БЛОК 2: МИНИ-НЕДЕЛЯ (свёрнуто по умолчанию) ═══ */}
      <div className="bg-surface border border-border rounded-xl mb-4 overflow-hidden">
        {/* Свёрнутая полоска с мини-иконками */}
        <button
          onClick={() => setWeekOpen(!weekOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer
                     hover:bg-black/5 transition-colors"
        >
          <span className="text-sm text-text-light">
            📅 Эта неделя
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs tracking-wider">{getWeekMiniIcons()}</span>
            <span className="text-xs text-text-light">{weekOpen ? '▲' : '▼'}</span>
          </div>
        </button>

        {/* Раскрытое содержимое */}
        {weekOpen && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-7 gap-1.5 mt-1">
              {weekDates.map((date, i) => {
                const data = weekData.find(d => d.date === date)
                const isTodayDate = date === todayStr
                const isPast = date < todayStr
                const hasTasks = (data?.total ?? 0) > 0
                const allDone = hasTasks && data!.done === data!.total
                const hasPartial = hasTasks && data!.done > 0 && !allDone

                return (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date)
                      setWeekOpen(false)
                    }}
                    className={`flex flex-col items-center gap-0.5 py-2 rounded-lg
                      transition-all cursor-pointer text-center
                      ${isTodayDate
                        ? 'bg-primary/10 border-2 border-primary'
                        : date === selectedDate
                          ? 'bg-blue-50 border-2 border-blue-300'
                          : 'bg-bg border-2 border-transparent hover:border-border'
                      }`}
                  >
                    <span className={`text-[10px] font-medium ${
                      isTodayDate ? 'text-primary' : 'text-text-light'
                    }`}>
                      {WEEKDAYS[i]}
                    </span>
                    <span className={`text-sm font-bold ${
                      isTodayDate ? 'text-primary' : 'text-text'
                    }`}>
                      {new Date(date).getDate()}
                    </span>
                    <span className="text-[10px]">
                      {allDone ? '✅' :
                       hasPartial ? `${data!.done}/${data!.total}` :
                       hasTasks ? `0/${data!.total}` :
                       isPast ? '·' : '—'}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-text-light justify-center">
              <span>✅ всё</span>
              <span>🟡 частично</span>
              <span>· пусто</span>
            </div>
          </div>
        )}
      </div>

      {/* === НАВИГАЦИЯ ПО ДАТАМ === */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevDay}
            className="w-10 h-10 flex items-center justify-center rounded-lg
                       hover:bg-bg transition-colors text-text-light
                       hover:text-text cursor-pointer"
          >
            ◀
          </button>

          {/* ЦЕНТР — клик открывает календарь */}
          <button
            onClick={() => setShowCalendar(true)}
            className="text-center cursor-pointer hover:bg-bg rounded-xl px-4 py-2 transition-colors"
          >
            <p className="text-sm text-text-light mb-1">
              {getDayLabel()}
            </p>
            <h1 className="text-xl font-bold text-text">
              {formatDateHuman(selectedDate)}
            </h1>
            <p className="text-[10px] text-text-light/60 mt-0.5">
              📅 нажмите для выбора даты
            </p>
          </button>

          <button
            onClick={goToNextDay}
            className="w-10 h-10 flex items-center justify-center rounded-lg
                       hover:bg-bg transition-colors text-text-light
                       hover:text-text cursor-pointer"
          >
            ▶
          </button>
        </div>

        {!isToday(selectedDate) && (
          <div className="text-center mt-3">
            <button
              onClick={goToToday}
              className="text-sm text-primary hover:text-primary-dark
                         transition-colors cursor-pointer"
            >
              ↩ Вернуться к сегодня
            </button>
          </div>
        )}
      </div>

      {/* === ЦИТАТА ДНЯ === */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💬</span>
          <div>
            <p className="text-sm text-text italic leading-relaxed">
              «{quote.text}»
            </p>
            <p className="text-xs text-text-light mt-1 text-right">
              — {quote.author}
            </p>
          </div>
        </div>
      </div>

      {/* === ШКАЛА ЭНЕРГИИ === */}
      <div className="mb-4">
        <EnergyScale value={entry.energyLevel} onChange={updateEnergy} />
      </div>

      {/* === УТРЕННИЙ БЛОК === */}
      <div className="mb-4">
        <MorningBlock
          intention={entry.morningIntention || ''}
          gratitude={entry.morningGratitude || ''}
          priorities={entry.morningPriorities || ['', '', '']}
          onIntentionChange={updateIntention}
          onGratitudeChange={updateGratitude}
          onPrioritiesChange={updatePriorities}
        />
      </div>

      {/* === СПИСОК ЗАДАЧ === */}
      <div className="mb-4">
        <TaskList
          tasks={tasks}
          currentDate={selectedDate}
          onAdd={addTask}
          onUpdateStatus={updateTaskStatus}
          onUpdatePriority={updateTaskPriority}
          onUpdateTag={updateTaskTag}
          onUpdateDuration={updateTaskDuration}
          onDelete={deleteTask}
          onRestoreTask={restoreTask}
          onAddSubtask={addSubtask}
          onToggleSubtask={toggleSubtask}
          onDeleteSubtask={deleteSubtask}
          onTransferTask={handleTransferTask}
          importGoals={importGoals}
        />
      </div>

      {/* === ВЕЧЕРНИЙ БЛОК === */}
      <div className="mb-4">
        <EveningBlock
          win={entry.eveningWin || ''}
          lesson={entry.eveningLesson || ''}
          tomorrow={entry.eveningTomorrow || ''}
          onWinChange={updateWin}
          onLessonChange={updateLesson}
          onTomorrowChange={updateTomorrow}
        />
      </div>

      {/* === КАЛЕНДАРЬ-ПОПАП === */}
      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        currentDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date)
          setShowCalendar(false)
        }}
      />

    </div>
  )
}