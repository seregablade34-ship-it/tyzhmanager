import { useState } from 'react'
import {
  getToday,
  getPrevDay,
  getNextDay,
  isToday,
  isFuture,
  formatDateHuman,
} from '../utils/dateHelpers'
import EnergyScale from '../components/EnergyScale'
import MorningBlock from '../components/MorningBlock'
import TaskList from '../components/TaskList'
import EveningBlock from '../components/EveningBlock'

interface TaskItem {
  id: number
  title: string
  isCompleted: boolean
}

export default function DailyPage() {
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [energyLevel, setEnergyLevel] = useState<number | undefined>(undefined)

  // Утренний блок
  const [intention, setIntention] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [priorities, setPriorities] = useState<string[]>(['', '', ''])

  // Список задач
  const [tasks, setTasks] = useState<TaskItem[]>([])

  // Вечерний блок
  const [win, setWin] = useState('')
  const [lesson, setLesson] = useState('')
  const [tomorrow, setTomorrow] = useState('')

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

  return (
    <div className="p-6 max-w-3xl mx-auto">

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

      {/* === ШКАЛА ЭНЕРГИИ === */}
      <div className="mb-4">
        <EnergyScale value={energyLevel} onChange={setEnergyLevel} />
      </div>

      {/* === УТРЕННИЙ БЛОК === */}
      <div className="mb-4">
        <MorningBlock
          intention={intention}
          gratitude={gratitude}
          priorities={priorities}
          onIntentionChange={setIntention}
          onGratitudeChange={setGratitude}
          onPrioritiesChange={setPriorities}
        />
      </div>

      {/* === СПИСОК ЗАДАЧ === */}
      <div className="mb-4">
        <TaskList tasks={tasks} onTasksChange={setTasks} />
      </div>

      {/* === ВЕЧЕРНИЙ БЛОК === */}
      <div className="mb-4">
        <EveningBlock
          win={win}
          lesson={lesson}
          tomorrow={tomorrow}
          onWinChange={setWin}
          onLessonChange={setLesson}
          onTomorrowChange={setTomorrow}
        />
      </div>

    </div>
  )
}