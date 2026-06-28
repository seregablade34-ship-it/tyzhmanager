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

  constructor() {
    super('tyzhmanager-db') // Имя базы данных в браузере

    // Версия 1 — начальная структура
    this.version(1).stores({
      // Формат: 'название таблицы': 'ключ, индекс1, индекс2, ...'
      // ++id = автоматический счётчик (1, 2, 3...)
      // Остальные поля — индексы для быстрого поиска

      strategies:     '++id, sphere, deadline, order',
      goals:          '++id, strategyId, sphere, year, status, order',
      ppSmarts:       '++id, goalId',
      actionSteps:    '++id, goalId, parentId, isCompleted, order',
      dailyEntries:   '++id, &date',          // &date = уникальная дата (1 запись на день)
      tasks:          '++id, dailyEntryId, goalId, date, isCompleted, order',
      goalEvaluations:'++id, goalId, date',
      achievements:   '++id, type, isUnlocked',
      combos:         '++id, type',
      userSettings:   '++id',
    })
  }
}

// Создаём единственный экземпляр базы (синглтон)
export const db = new TyzhManagerDB()