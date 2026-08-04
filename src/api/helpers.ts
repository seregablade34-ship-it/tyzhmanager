// ==========================================
// API HELPERS — мост между фронтендом и Supabase
// Конвертация camelCase ↔ snake_case + CRUD обёртки
// Версия 2: user_id + RLS (автоматическая фильтрация)
// ==========================================

import { supabase } from '../lib/supabase'
import type {
  Strategy, Goal, PpSmart, ActionStep,
  DailyEntry, Task, GoalEvaluation,
  Achievement, Combo, UserSettings,
  DescartesSquare, ThreePResult, CoachingSession,
  GoalReflection, TaskTransfer,
} from '../types'

// ==========================================
// КОНВЕРТЕР КЛЮЧЕЙ camelCase ↔ snake_case
// ==========================================

const SPECIAL_TO_SNAKE: Record<string, string> = { order: 'sort_order' }
const SPECIAL_TO_CAMEL: Record<string, string> = { sort_order: 'order' }

function camelToSnake(key: string): string {
  if (SPECIAL_TO_SNAKE[key]) return SPECIAL_TO_SNAKE[key]
  return key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)
}

function snakeToCamel(key: string): string {
  if (SPECIAL_TO_CAMEL[key]) return SPECIAL_TO_CAMEL[key]
  return key.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
}

/** Объект camelCase → snake_case (для отправки в Supabase) */
export function toSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, val] of Object.entries(obj)) {
    result[camelToSnake(key)] = val
  }
  return result
}

/** Объект snake_case → camelCase (для получения из Supabase) */
export function toCamel<T = any>(obj: Record<string, any>): T {
  const result: Record<string, any> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (key === 'user_id') continue
    result[snakeToCamel(key)] = val
  }
  return result as T
}

/** Массив snake_case → camelCase */
export function toCamelArray<T = any>(arr: Record<string, any>[]): T[] {
  return arr.map(item => toCamel<T>(item))
}

// ==========================================
// ФАБРИКА CRUD ДЛЯ ТАБЛИЦЫ
// RLS автоматически фильтрует по user_id!
// ==========================================

export function createTable<T extends { id?: number }>(
  tableName: string,
  upsertConflict?: string
) {
  return {
    // --- ЧТЕНИЕ ---

    async getAll(orderBy?: string, ascending = true): Promise<T[]> {
      let q = supabase.from(tableName).select('*')
      if (orderBy) q = q.order(camelToSnake(orderBy), { ascending })
      const { data, error } = await q
      if (error) throw error
      return toCamelArray<T>(data || [])
    },

    async getById(id: number): Promise<T | null> {
      const { data, error } = await supabase
        .from(tableName).select('*')
        .eq('id', id)
        .maybeSingle()
      if (error || !data) return null
      return toCamel<T>(data)
    },

    async getWhere(field: string, value: any, orderBy?: string, ascending = true): Promise<T[]> {
      let q = supabase.from(tableName).select('*')
        .eq(camelToSnake(field), value)
      if (orderBy) q = q.order(camelToSnake(orderBy), { ascending })
      const { data, error } = await q
      if (error) throw error
      return toCamelArray<T>(data || [])
    },

    async getOneWhere(field: string, value: any): Promise<T | null> {
      const { data, error } = await supabase
        .from(tableName).select('*')
        .eq(camelToSnake(field), value)
        .maybeSingle()
      if (error || !data) return null
      return toCamel<T>(data)
    },

    // --- ЗАПИСЬ ---

    async create(item: Partial<T>): Promise<T> {
      const snake = toSnake(item as Record<string, any>)
      delete snake.id
      delete snake.user_id
      const { data, error } = await supabase
        .from(tableName).insert(snake).select().single()
      if (error) throw error
      return toCamel<T>(data)
    },

    async put(item: Partial<T>): Promise<T> {
      const snake = toSnake(item as Record<string, any>)
      delete snake.user_id
      const opts = upsertConflict ? { onConflict: upsertConflict } : undefined
      const { data, error } = await supabase
        .from(tableName).upsert(snake, opts).select().single()
      if (error) throw error
      return toCamel<T>(data)
    },

    async update(id: number, changes: Partial<T>): Promise<void> {
      const snake = toSnake(changes as Record<string, any>)
      delete snake.id
      delete snake.user_id
      const { error } = await supabase
        .from(tableName).update(snake)
        .eq('id', id)
      if (error) throw error
    },

    // --- УДАЛЕНИЕ ---

    async remove(id: number): Promise<void> {
      const { error } = await supabase
        .from(tableName).delete()
        .eq('id', id)
      if (error) throw error
    },

    async bulkRemove(ids: number[]): Promise<void> {
      if (ids.length === 0) return
      const { error } = await supabase
        .from(tableName).delete()
        .in('id', ids)
      if (error) throw error
    },

    // --- УТИЛИТЫ ---

    async count(field?: string, value?: any): Promise<number> {
      let q = supabase
        .from(tableName).select('id', { count: 'exact', head: true })
      if (field && value !== undefined) q = q.eq(camelToSnake(field), value)
      const { count, error } = await q
      if (error) throw error
      return count || 0
    },

    query() {
      return supabase.from(tableName).select('*')
    },
  }
}

// ==========================================
// ГОТОВЫЕ ЭКЗЕМПЛЯРЫ ВСЕХ ТАБЛИЦ
// ==========================================

export const strategiesTable   = createTable<Strategy>('strategies')
export const goalsTable        = createTable<Goal>('goals')
export const ppSmartsTable     = createTable<PpSmart>('pp_smarts')
export const actionStepsTable  = createTable<ActionStep>('action_steps')
export const dailyEntriesTable = createTable<DailyEntry>('daily_entries', 'user_id,date')
export const tasksTable        = createTable<Task>('tasks')
export const evalTable         = createTable<GoalEvaluation>('goal_evaluations')
export const achievementsTable = createTable<Achievement>('achievements')
export const combosTable       = createTable<Combo>('combos')
export const settingsTable     = createTable<UserSettings>('user_settings', 'user_id')
export const descartesTable    = createTable<DescartesSquare>('descartes_squares')
export const threePTable       = createTable<ThreePResult>('three_p_results')
export const coachingTable     = createTable<CoachingSession>('coaching_sessions')
export const reflectionsTable  = createTable<GoalReflection>('goal_reflections')
export const transfersTable    = createTable<TaskTransfer>('task_transfers')