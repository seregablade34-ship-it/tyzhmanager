import { useState } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

const SLIDES = [
  {
    emoji: '🎯',
    title: 'Добро пожаловать!',
    subtitle: '#тыжменеджер — дневник целей эффективного человека',
    description:
      'Это не просто планировщик. Это система, которая поможет превратить мечты в конкретные результаты. Основано на авторской методологии PP SMART.',
    bg: 'from-blue-500/20 to-blue-600/10',
    accent: 'bg-blue-600',
  },
  {
    emoji: '📅',
    title: 'Планируй день',
    subtitle: 'Ежедневник с фокусом на энергии и задачах',
    description:
      'Каждое утро — настрой на день. Вечером — рефлексия. Отслеживай энергию, ставь задачи, фиксируй благодарности. Формируй привычку осознанного дня.',
    bg: 'from-green-500/20 to-green-600/10',
    accent: 'bg-green-600',
  },
  {
    emoji: '🏆',
    title: 'Ставь большие цели',
    subtitle: 'От стратегии на 5 лет до ежедневных задач',
    description:
      'Стратегия → Цели на год → PP SMART → Экшен-каскад. Каскадируй большую мечту до маленьких шагов, которые можно сделать сегодня.',
    bg: 'from-purple-500/20 to-purple-600/10',
    accent: 'bg-purple-600',
  },
  {
    emoji: '🚀',
    title: 'Начни прямо сейчас!',
    subtitle: 'Всё хранится на твоём устройстве',
    description:
      'Никакой регистрации. Никаких подписок. Приложение работает даже без интернета. Твои данные — только твои. Просто открой Ежедневник и начни.',
    bg: 'from-orange-500/20 to-orange-600/10',
    accent: 'bg-orange-600',
  },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slide = SLIDES[currentSlide]
  const isLast = currentSlide === SLIDES.length - 1

  function goNext() {
    if (isLast) {
      onComplete()
    } else {
      setCurrentSlide(prev => prev + 1)
    }
  }

  function goPrev() {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }

  function skip() {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex flex-col">
      {/* Кнопка пропустить */}
      {!isLast && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={skip}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                       transition-colors cursor-pointer px-3 py-1"
          >
            Пропустить →
          </button>
        </div>
      )}

      {/* Основной контент */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          {/* Градиентный фон за эмодзи */}
          <div
            className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${slide.bg}
                        flex items-center justify-center mb-8`}
          >
            <span className="text-6xl">{slide.emoji}</span>
          </div>

          {/* Заголовок */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {slide.title}
          </h1>

          {/* Подзаголовок */}
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-4">
            {slide.subtitle}
          </p>

          {/* Описание */}
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="p-6 pb-8">
        {/* Точки-индикаторы */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`rounded-full transition-all cursor-pointer
                ${idx === currentSlide
                  ? `w-8 h-3 ${slide.accent}`
                  : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
            />
          ))}
        </div>

        {/* Кнопки навигации */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {currentSlide > 0 && (
            <button
              onClick={goPrev}
              className="px-6 py-3 rounded-xl text-gray-500 hover:text-gray-700
                         dark:text-gray-400 dark:hover:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-slate-800
                         transition-colors cursor-pointer font-medium"
            >
              ← Назад
            </button>
          )}

          <button
            onClick={goNext}
            className={`flex-1 max-w-xs py-3.5 rounded-xl text-white font-bold text-lg
                       transition-all cursor-pointer hover:shadow-lg
                       active:scale-[0.98] ${slide.accent}`}
          >
            {isLast ? '🚀 Начать!' : 'Далее →'}
          </button>
        </div>
      </div>
    </div>
  )
}