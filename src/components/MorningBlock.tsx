interface MorningBlockProps {
  intention: string
  gratitude: string
  priorities: string[]
  onIntentionChange: (value: string) => void
  onGratitudeChange: (value: string) => void
  onPrioritiesChange: (value: string[]) => void
}

export default function MorningBlock({
  intention,
  gratitude,
  priorities,
  onIntentionChange,
  onGratitudeChange,
  onPrioritiesChange,
}: MorningBlockProps) {

  function updatePriority(index: number, value: string) {
    const updated = [...priorities]
    updated[index] = value
    onPrioritiesChange(updated)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 overflow-hidden">
      <h2 className="font-semibold text-text mb-4">🌅 Утренний блок</h2>

      {/* Намерение на день */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-light mb-1">
          🎯 Моё намерение на день
        </label>
        <input
          type="text"
          value={intention}
          onChange={(e) => onIntentionChange(e.target.value)}
          placeholder="Чего я хочу достичь сегодня?"
          className="w-full px-3 py-2 rounded-lg border border-border
                     bg-bg text-text placeholder-text-light/50
                     focus:outline-none focus:ring-2 focus:ring-primary/30
                     focus:border-primary transition-colors"
        />
      </div>

      {/* Благодарность */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-light mb-1">
          🙏 Я благодарен за...
        </label>
        <input
          type="text"
          value={gratitude}
          onChange={(e) => onGratitudeChange(e.target.value)}
          placeholder="За что вы благодарны сегодня?"
          className="w-full px-3 py-2 rounded-lg border border-border
                     bg-bg text-text placeholder-text-light/50
                     focus:outline-none focus:ring-2 focus:ring-primary/30
                     focus:border-primary transition-colors"
        />
      </div>

      {/* Приоритеты на день (до 3) */}
      <div className="overflow-hidden">
        <label className="block text-sm font-medium text-text-light mb-1">
          🔥 Топ-3 приоритета на день
        </label>
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex items-center gap-2 mb-2 min-w-0">
            <span className="text-sm font-bold text-primary w-5 text-center flex-shrink-0">
              {index + 1}
            </span>
            <input
              type="text"
              value={priorities[index] || ''}
              onChange={(e) => updatePriority(index, e.target.value)}
              placeholder={`Приоритет ${index + 1}`}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border
                         bg-bg text-text placeholder-text-light/50
                         focus:outline-none focus:ring-2 focus:ring-primary/30
                         focus:border-primary transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  )
}