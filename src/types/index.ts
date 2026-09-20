// ==========================================
// ТИПЫ ДАННЫХ ПРИЛОЖЕНИЯ #тыжменеджер
// ==========================================

// --- ЦЕЛИ (единый раздел) ---
export interface MonthProgress {
  checked: boolean        // Отмечен ли месяц
  comment: string         // Комментарий к месяцу
}

export type GoalPriority = 'absolute' | 'high' | 'medium' | 'low'

export interface Goal {
  id?: number
  title: string           // Название цели
  description: string     // Описание
  sphere: string          // Сфера жизни
  deadline: string        // Срок (любая дата: "2026-06-30", "2031-12-31")
  status: 'active' | 'completed' | 'cancelled'  // Статус
  progress: number        // Прогресс 0-100
  priority: GoalPriority  // Приоритет (автоматически от 3П)
  monthlyProgress?: MonthProgress[]  // 12 месяцев (трекер)
  createdAt: string
  updatedAt: string
  order: number
}

// --- PP SMART (детализация цели) ---
export interface PpSmart {
  id?: number
  goalId: number          // Связь с целью
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
  description?: string    // Описание шага
  actions?: string        // Действия и намерения
  order: number           // Порядок
  level: number           // Уровень вложенности (0, 1, 2...)
  createdAt: string
  updatedAt: string
}

// --- ЕЖЕДНЕВНИК (запись на один день) ---
export interface DailyEntry {
  id?: number
  date: string            // Дата в формате "2026-01-15"
  energyLevel?: number    // Уровень энергии 0-10 (утро — до 14:00)
  energyEvening?: number  // Уровень энергии 0-10 (вечер — после 14:00)
  energyAnchor?: string   // Энергетический якорь (1 слово — ощущение в теле)
  
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
export type TaskStatus = 'not-started' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskTag = 'focus' | 'goal' | 'control' | 'routine' | 'personal' | 'meeting' | 'letter'

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
  status: TaskStatus      // Статус задачи
  priority: TaskPriority  // Приоритет
  tag?: TaskTag           // Тег (необязательно)
  duration?: number       // Время на задачу в минутах (по умолчанию 60)
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
// ОЦЕНКА ЦЕЛЕЙ — 2 инструмента
// ==========================================

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

export interface GoalReflection {
  id?: number
  goalId?: number         // Связь с целью
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

// --- ПЕРЕНОС/ДУБЛИРОВАНИЕ ЗАДАЧ ---
export type TransferReason = 'routine' | 'not-finished' | 'other'

export interface TaskTransfer {
  id?: number
  taskId: number              // Исходная задача
  fromDate: string            // Откуда (дата)
  toDate: string              // Куда (дата)
  type: 'move' | 'duplicate'  // Перенос или дубль
  reason: TransferReason      // Причина
  comment?: string            // Комментарий (для not-finished и other)
  createdAt: string
}