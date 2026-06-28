interface EveningBlockProps {
  win: string
  lesson: string
  tomorrow: string
  onWinChange: (value: string) => void
  onLessonChange: (value: string) => void
  onTomorrowChange: (value: string) => void
}

export default function EveningBlock({
  win,
  lesson,
  tomorrow,
  onWinChange,
  onLessonChange,
  onTomorrowChange,
}: EveningBlockProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h2 className="font-semibold text-text mb-4">🌙 Вечерний блок</h2>

      {/* Главная победа */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-light mb-1">
          🏆 Моя главная победа сегодня
        </label>
        <input
          type="text"
          value={win}
          onChange={(e) => onWinChange(e.target.value)}
          placeholder="Чем я горжусь сегодня?"
          className="w-full px-3 py-2 rounded-lg border border-border
                     bg-bg text-text placeholder-text-light/50
                     focus:outline-none focus:ring-2 focus:ring-primary/30
                     focus:border-primary transition-colors"
        />
      </div>

      {/* Урок дня */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-light mb-1">
          📝 Какой урок я извлёк
        </label>
        <input
          type="text"
          value={lesson}
          onChange={(e) => onLessonChange(e.target.value)}
          placeholder="Что я понял / чему научился?"
          className="w-full px-3 py-2 rounded-lg border border-border
                     bg-bg text-text placeholder-text-light/50
                     focus:outline-none focus:ring-2 focus:ring-primary/30
                     focus:border-primary transition-colors"
        />
      </div>

      {/* План на завтра */}
      <div>
        <label className="block text-sm font-medium text-text-light mb-1">
          🎯 Что я сделаю завтра
        </label>
        <input
          type="text"
          value={tomorrow}
          onChange={(e) => onTomorrowChange(e.target.value)}
          placeholder="Мой главный фокус на завтра"
          className="w-full px-3 py-2 rounded-lg border border-border
                     bg-bg text-text placeholder-text-light/50
                     focus:outline-none focus:ring-2 focus:ring-primary/30
                     focus:border-primary transition-colors"
        />
      </div>
    </div>
  )
}