// ==========================================
// БАЗА ДАННЫХ ПРИЛОЖЕНИЯ #тыжменеджер
// Dexie.js — удобная обёртка над IndexedDB
// ==========================================

import Dexie, { type Table } from 'dexie'
import type {
  Strategy,
  Goal,
  PpSmart,
  ActionStep,
  DailyEntry,
  Task,
  GoalEvaluation,
  Achievement,
  Combo,
  UserSettings,
  DescartesSquare,
  EisenhowerItem,
  ThreePResult,
  CoachingSession,
} from '../types'

// Класс нашей базы данных
class TyzhManagerDB extends Dexie {
  // Объявляем таблицы
  strategies!: Table<Strategy>
  goals!: Table<Goal>
  ppSmarts!: Table<PpSmart>
  actionSteps!: Table<ActionStep>
  dailyEntries!: Table<DailyEntry>
  tasks!: Table<Task>
  goalEvaluations!: Table<GoalEvaluation>
  achievements!: Table<Achievement>
  combos!: Table<Combo>
  userSettings!: Table<UserSettings>
  // Новые таблицы — Оценка целей
  descartesSquares!: Table<DescartesSquare>
  eisenhowerItems!: Table<EisenhowerItem>
  threePResults!: Table<ThreePResult>
  coachingSessions!: Table<CoachingSession>

  constructor() {
    super('tyzhmanager-db') // Имя базы данных в браузере

    // Версия 1 — начальная структура
    this.version(1).stores({
      strategies:     '++id, sphere, deadline, order',
      goals:          '++id, strategyId, sphere, year, status, order',
      ppSmarts:       '++id, goalId',
      actionSteps:    '++id, goalId, parentId, isCompleted, order',
      dailyEntries:   '++id, &date',
      tasks:          '++id, dailyEntryId, goalId, date, isCompleted, order',
      goalEvaluations:'++id, goalId, date',
      achievements:   '++id, type, isUnlocked',
      combos:         '++id, type',
      userSettings:   '++id',
    })

    // Версия 2 — добавляем таблицы оценки целей
    this.version(2).stores({
      strategies:       '++id, sphere, deadline, order',
      goals:            '++id, strategyId, sphere, year, status, order',
      ppSmarts:         '++id, goalId',
      actionSteps:      '++id, goalId, parentId, isCompleted, order',
      dailyEntries:     '++id, &date',
      tasks:            '++id, dailyEntryId, goalId, date, isCompleted, order',
      goalEvaluations:  '++id, goalId, date',
      achievements:     '++id, type, isUnlocked',
      combos:           '++id, type',
      userSettings:     '++id',
      // Новые таблицы
      descartesSquares: '++id, goalId',
      eisenhowerItems:  '++id, goalId, quadrant',
      threePResults:    '++id, goalId',
      coachingSessions: '++id, goalId, isCompleted',
    })

    // Версия 3 — обновляем задачи: status вместо isCompleted, + tag, actionStepId
    this.version(3).stores({
      strategies:       '++id, sphere, deadline, order',
      goals:            '++id, strategyId, sphere, year, status, order',
      ppSmarts:         '++id, goalId',
      actionSteps:      '++id, goalId, parentId, isCompleted, order',
      dailyEntries:     '++id, &date',
      tasks:            '++id, dailyEntryId, goalId, actionStepId, date, status, priority, tag, order',
      goalEvaluations:  '++id, goalId, date',
      achievements:     '++id, type, isUnlocked',
      combos:           '++id, type',
      userSettings:     '++id',
      descartesSquares: '++id, goalId',
      eisenhowerItems:  '++id, goalId, quadrant',
      threePResults:    '++id, goalId',
      coachingSessions: '++id, goalId, isCompleted',
    }).upgrade(tx => {
      // Миграция: конвертируем старые задачи (isCompleted → status)
      return tx.table('tasks').toCollection().modify(task => {
        // Если у задачи старый формат — конвертируем
        if (task.isCompleted !== undefined && task.status === undefined) {
          task.status = task.isCompleted ? 'done' : 'not-started'
        }
        // Устанавливаем значения по умолчанию для новых полей
        if (!task.status) task.status = 'not-started'
        if (!task.priority) task.priority = 'medium'
        if (!task.subtasks) task.subtasks = []
      })
    })
  }
}

// Создаём единственный экземпляр базы (синглтон)
export const db = new TyzhManagerDB()