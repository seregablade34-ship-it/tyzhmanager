interface EnergyScaleProps {
  value: number | undefined
  onChange: (value: number) => void
}

export default function EnergyScale({ value, onChange }: EnergyScaleProps) {

  // Определяем цвет по уровню энергии
  function getEnergyColor(level: number): string {
    if (level <= 3) return 'bg-energy-red'
    if (level <= 6) return 'bg-energy-gray'
    if (level <= 8) return 'bg-energy-green'
    return 'bg-energy-yellow'
  }

  // Текст-подсказка по уровню
  function getEnergyLabel(level: number): string {
    if (level <= 1) return '😴 Без сил'
    if (level <= 3) return '😔 Мало энергии'
    if (level <= 5) return '😐 Нормально'
    if (level <= 7) return '🙂 Хорошо'
    if (level <= 8) return '😊 Отлично'
    if (level <= 9) return '🔥 Энергия бьёт ключом'
    return '⚡ Максимум!'
  }

  // Текстовый цвет для подсказки
  function getEnergyTextColor(level: number): string {
    if (level <= 3) return 'text-energy-red'
    if (level <= 6) return 'text-energy-gray'
    if (level <= 8) return 'text-energy-green'
    return 'text-energy-yellow'
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-text">⚡ Уровень энергии</h2>
        {value !== undefined && (
          <span className={`text-2xl font-bold ${getEnergyTextColor(value)}`}>
            {value}/10
          </span>
        )}
      </div>

      {/* Точки для выбора */}
      <div className="flex items-center gap-1.5 mb-2">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`
              flex-1 h-10 rounded-lg cursor-pointer transition-all duration-200
              flex items-center justify-center text-sm font-medium
              ${value === i
                ? `${getEnergyColor(i)} text-white scale-110 shadow-md`
                : value !== undefined && i <= value
                  ? `${getEnergyColor(i)} text-white opacity-60`
                  : 'bg-bg text-text-light hover:bg-border'
              }
            `}
          >
            {i}
          </button>
        ))}
      </div>

      {/* Подсказка */}
      {value !== undefined && (
        <p className={`text-sm text-center mt-2 ${getEnergyTextColor(value)}`}>
          {getEnergyLabel(value)}
        </p>
      )}

      {value === undefined && (
        <p className="text-sm text-center mt-2 text-text-light">
          Нажмите на число, чтобы оценить уровень энергии
        </p>
      )}
    </div>
  )
}