import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DONATE_URL = 'https://pay.cloudtips.ru/p/a385148f'

const slides = [
  {
    icon: '🚀',
    title: 'Добро пожаловать!',
    subtitle: '#тыжменеджер — дневник целей эффективного человека',
    description:
      'Это не просто планировщик. Это система, которая поможет превратить мечты в конкретные результаты. С помощью классических инструментов и авторских методик, например, PP SMART.',
  },
  {
    icon: '🎯',
    title: 'Ставь большие цели',
    subtitle: 'От стратегии на 5 лет до ежедневных задач',
    description:
      'Стратегия → Цели на год → PP SMART → Экшен-каскад. Каскадируй большую мечту до маленьких шагов, которые можно сделать прямо сейчас.',
  },
  {
    icon: '📅',
    title: 'Планируй каждый день',
    subtitle: 'Фокус на главном',
    description:
      'Ежедневник с задачами, приоритетами и привычками. Фиксируй прогресс, отмечай победы и двигайся к цели каждый день.',
  },
  {
    icon: '📊',
    title: 'Отслеживай прогресс',
    subtitle: 'Аналитика и мотивация',
    description:
      'Визуальная статистика достижений, серии продуктивных дней и система уровней. Видь свой рост и не теряй мотивацию.',
  },
  {
    icon: '❤️',
    title: 'Это только начало...',
    subtitle: '',
    description:
      'Сегодня #тыжменеджер — это ежедневник для достижения целей.\nЗавтра — умный помощник с ИИ, мобильное приложение и инструмент для работы команд.\n\nСпасибо, что стали частью этого пути ❤️',
  },
]

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)

  const slide = slides[currentSlide]
  const isLast = currentSlide === slides.length - 1
  const isFirst = currentSlide === 0

  function handleNext() {
    if (isLast) {
      handleFinish()
    } else {
      setDirection(1)
      setCurrentSlide(prev => prev + 1)
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setDirection(-1)
      setCurrentSlide(prev => prev - 1)
    }
  }

  function handleFinish() {
    localStorage.setItem('tyzhmanager_onboarding_done', 'true')
    onComplete()
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--app-surface)',
          color: 'var(--app-text)',
        }}
      >
        {/* Пропустить */}
        {!isLast && (
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 text-sm opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: 'var(--app-text-light)' }}
          >
            Пропустить
          </button>
        )}

        {/* Контент слайда */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* Иконка */}
            <div className="mb-6 text-5xl">{slide.icon}</div>

            {/* Заголовок */}
            <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>

            {/* Подзаголовок */}
            {slide.subtitle && (
              <p
                className="text-sm font-medium mb-4"
                style={{ color: 'var(--app-text-light)' }}
              >
                {slide.subtitle}
              </p>
            )}

            {/* Описание */}
            <p
              className="whitespace-pre-line leading-relaxed mb-8"
              style={{ color: 'var(--app-text-light)' }}
            >
              {slide.description}
            </p>

            {/* Кнопки */}
            {isLast ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <button
                  onClick={handleFinish}
                  className="w-full sm:w-auto px-8 py-3 text-base bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  Начать пользоваться
                </button>
                <a
                  href={DONATE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--app-text-light)' }}
                >
                  Поддержать развитие проекта
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                {!isFirst && (
                  <button
                    onClick={handlePrev}
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium hover:bg-bg transition cursor-pointer"
                    style={{ color: 'var(--app-text)' }}
                  >
                    Назад
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`${isFirst ? 'w-full' : 'flex-1'} px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition cursor-pointer`}
                >
                  Далее
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Точки навигации */}
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}