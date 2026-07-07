// ==========================================
// ТИПЫ ДАННЫХ ПРИЛОЖЕНИЯ #тыжменеджер
// ==========================================

// --- СТРАТЕГИЯ (5 лет) ---
export interface Strategy {
  id?: number
  title: string           // Название стратегической цели
  description: string     // Описание
  sphere: string          // Сфера жизни (здоровье, карьера, и т.д.)
  deadline: string        // Срок (например "2030")
  status: 'active' | 'completed' | 'cancelled'  // Статус
  createdAt: string       // Дата создания
  updatedAt: string       // Дата обновления
  order: number           // Порядок отображения
}

// --- ЦЕЛИ НА ГОД ---
export interface Goal {
  id?: number
  strategyId?: number     // Связь со стратегией (необязательно)
  title: string           // Название цели
  description: string     // Описание
  sphere: string          // Сфера жизни
  year: number            // Год
  status: 'active' | 'completed' | 'cancelled'  // Статус
  progress: number        // Прогресс 0-100
  createdAt: string
  updatedAt: string
  order: number
}

// --- PP SMART (детализация цели) ---
export interface PpSmart {
  id?: number
  goalId: number          // Связь с целью на год
  positive: string        // Позитивная формулировка
  personal: string        // Личная ответственность
  specific: string        // Конкретность
  measurable: string      // Измеримость
  achievable: string      // Достижимость
  relevant: string        // Актуальность
  timeBound: string       // Ограниченность по времени
  createdAt: string
  updatedAt: string
}

// --- ЭКШЕН-КАСКАДИРОВАНИЕ (шаги к цели) ---
export interface ActionStep {
  id?: number
  goalId: number          // Связь с целью
  parentId?: number       // Родительский шаг (для вложенности)
  title: string           // Название шага
  isCompleted: boolean    // Выполнен?
  deadline?: string       // Срок
  order: number           // Порядок
  level: number           // Уровень вложенности (0, 1, 2...)
  createdAt: string
  updatedAt: string
}

// --- ЕЖЕДНЕВНИК (запись на один день) ---
export interface DailyEntry {
  id?: number
  date: string            // Дата в формате "2026-01-15"
  energyLevel?: number    // Уровень энергии 0-10
  
  // Утренний блок
  morningIntention?: string    // Намерение на день
  morningGratitude?: string    // Благодарность
  morningPriorities?: string[] // Приоритеты на день (до 3)
  
  // Вечерний блок (рефлексия)
  eveningWin?: string          // Главная победа дня
  eveningLesson?: string       // Урок дня
  eveningTomorrow?: string     // Что сделаю завтра
  
  createdAt: string
  updatedAt: string
}

// --- ЗАДАЧИ (ежедневные) ---
export type TaskStatus = 'not-started' | 'planned' | 'in-progress' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskTag = 'focus' | 'goal' | 'control' | 'routine' | 'personal'

export interface SubTask {
  id: string              // Уникальный ID (uuid-подобный)
  title: string           // Текст подзадачи
  isCompleted: boolean    // Выполнена?
}

export interface Task {
  id?: number
  dailyEntryId?: number   // Связь с днём
  goalId?: number         // Связь с целью (необязательно)
  actionStepId?: number   // Связь с шагом каскада (необязательно)
  date: string            // Дата
  title: string           // Текст задачи
  status: TaskStatus      // 4 статуса задачи
  priority: TaskPriority  // Приоритет
  tag?: TaskTag           // Тег (необязательно)
  subtasks: SubTask[]     // Подзадачи (декомпозиция)
  order: number           // Порядок
  createdAt: string
  updatedAt: string
}

// --- ОЦЕНКА ЦЕЛЕЙ ---
export interface GoalEvaluation {
  id?: number
  goalId: number          // Связь с целью
  date: string            // Дата оценки
  score: number           // Оценка 1-10
  comment?: string        // Комментарий
  createdAt: string
}

// --- ДОСТИЖЕНИЯ (бейджи) ---
export interface Achievement {
  id?: number
  type: string            // Тип достижения
  title: string           // Название
  description: string     // Описание
  icon: string            // Иконка
  unlockedAt?: string     // Когда получено
  isUnlocked: boolean     // Разблокировано?
}

// --- КОМБО (серии дней) ---
export interface Combo {
  id?: number
  type: string            // Тип комбо (daily_fill, tasks_done и т.д.)
  currentStreak: number   // Текущая серия
  bestStreak: number      // Лучшая серия
  lastDate: string        // Последний день серии
  updatedAt: string
}

// --- НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ ---
export interface UserSettings {
  id?: number
  userName?: string       // Имя пользователя
  startOfDay: string      // Начало дня (по умолчанию "09:00")
  theme: 'light' | 'dark' // Тема
  notificationsEnabled: boolean  // Уведомления
  onboardingCompleted: boolean   // Онбординг пройден
  createdAt: string
  updatedAt: string
}

// ==========================================
// ОЦЕНКА ЦЕЛЕЙ — 4 инструмента
// ==========================================

// Квадрат Декарта — 4 вопроса, на каждый минимум 3 ответа
export interface DescartesSquare {
  id?: number
  goalId: number
  // 4 квадранта — массивы ответов (минимум 3 в каждом)
  doPositive: string[]     // Что случится, если СДЕЛАЮ?
  dontNegative: string[]   // Что случится, если НЕ сделаю?
  doNegative: string[]     // Чего НЕ случится, если СДЕЛАЮ?
  dontPositive: string[]   // Чего НЕ случится, если НЕ сделаю?
  recommendation: 'do' | 'dont' | 'unclear'  // Результат
  createdAt: string
  updatedAt: string
}

// Матрица Эйзенхауэра — позиция цели в матрице
export type EisenhowerQuadrant =
  | 'urgent-important'      // 🔴 Делай сейчас
  | 'not-urgent-important'  // 🟡 Запланируй
  | 'urgent-not-important'  // 🔵 Делегируй
  | 'not-urgent-not-important' // ⚪ Подумай, нужно ли

export interface EisenhowerItem {
  id?: number
  goalId: number
  quadrant: EisenhowerQuadrant
  createdAt: string
  updatedAt: string
}

// Метод 3П — простой фильтр ДА/НЕТ
export type ThreePPriority =
  | 'absolute'  // 3 ДА — Абсолютный приоритет
  | 'high'      // 2 ДА — Высокий
  | 'low'       // 1 ДА — Низкий
  | 'trash'     // 3 НЕТ — Мусор

export interface ThreePResult {
  id?: number
  goalId: number
  approaching: boolean    // Приближение — приближает к цели?
  consequences: boolean   // Последствия — последствия бездействия критичны?
  profit: boolean         // Профит — есть ощутимая выгода?
  priority: ThreePPriority
  createdAt: string
  updatedAt: string
}

// Мини-самокоучинг — 10 вопросов
export interface CoachingSession {
  id?: number
  goalId: number
  answers: string[]       // 10 ответов (по индексу вопроса)
  currentStep: number     // Текущий шаг (0-9) для wizard
  isCompleted: boolean    // Все 10 вопросов отвечены
  createdAt: string
  updatedAt: string
}

// ==========================================
// РЕФЛЕКСИЯ ПРИ ЗАВЕРШЕНИИ ЦЕЛИ
// ==========================================

// Рефлексия при завершении цели (для Стратегии и Целей на год)
export interface GoalReflection {
  id?: number
  goalId?: number         // Связь с целью на год (необязательно)
  strategyId?: number     // Связь со стратегией (необязательно)
  type: 'completed' | 'failed'  // Выполнено или не выполнено

  // 3 вопроса при ВЫПОЛНЕНИИ
  whatWorked?: string     // Что помогло достичь цели?
  whatLearned?: string    // Чему я научился?
  whatNext?: string       // Что дальше? Какой следующий шаг?

  // 3 вопроса при НЕВЫПОЛНЕНИИ
  whatPrevented?: string  // Что помешало?
  whatWouldChange?: string // Что бы я сделал иначе?
  isStillRelevant?: string // Цель всё ещё актуальна? Что дальше?

  createdAt: string
  updatedAt: string
}