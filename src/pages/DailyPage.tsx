import { useState } from 'react'
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
import EnergyScale from '../components/EnergyScale'
import MorningBlock from '../components/MorningBlock'
import TaskList from '../components/TaskList'
import EveningBlock from '../components/EveningBlock'

export default function DailyPage() {
  const [selectedDate, setSelectedDate] = useState(getToday())

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
    toggleTask,
    deleteTask,
  } = useDailyEntry(selectedDate)

  // Цитата дня
  const quote = getDailyQuote()

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

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* === НАВИГАЦИЯ ПО ДАТАМ === */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevDay}
            className="w-10 h-10 flex items-center justify-center rounded-lg
                       hover:bg-bg transition-colors text-text-light
                       hover:text-text cursor-pointer"
          >
            ◀
          </button>

          <div className="text-center">
            <p className="text-sm text-text-light mb-1">
              {getDayLabel()}
            </p>
            <h1 className="text-xl font-bold text-text">
              {formatDateHuman(selectedDate)}
            </h1>
          </div>

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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-5 py-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">💬</span>
          <p className="text-sm text-text italic leading-relaxed flex-1">
            «{quote.text}»
            <span className="not-italic text-text-light ml-2">— {quote.author}</span>
          </p>
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
          onAdd={addTask}
          onToggle={toggleTask}
          onDelete={deleteTask}
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

    </div>
  )
}