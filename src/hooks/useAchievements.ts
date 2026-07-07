import { useState, useEffect, useCallback } from 'react'
import { db } from '../db/database'

// ==========================================
// ОПРЕДЕЛЕНИЯ ДОСТИЖЕНИЙ
// ==========================================

export interface AchievementDef {
  id: string
  icon: string
  title: string
  description: string
  xp: number
  category: 'combo' | 'goals' | 'daily' | 'tools' | 'special'
}

export interface UnlockedAchievement extends AchievementDef {
  unlockedAt: string
}

// ВСЕ ДОСТИЖЕНИЯ (25 штук)
export const ACHIEVEMENTS: AchievementDef[] = [
  // 🔥 КОМБО
  { id: 'combo_3', icon: '🔥', title: 'Разогрев', description: 'Комбо 3 дня подряд', xp: 30, category: 'combo' },
  { id: 'combo_7', icon: '🔥', title: 'Неделя огня', description: 'Комбо 7 дней подряд', xp: 70, category: 'combo' },
  { id: 'combo_14', icon: '🔥', title: 'Двухнедельный марафон', description: 'Комбо 14 дней подряд', xp: 150, category: 'combo' },
  { id: 'combo_30', icon: '🌟', title: 'Месяц дисциплины', description: 'Комбо 30 дней подряд', xp: 300, category: 'combo' },
  { id: 'combo_60', icon: '💎', title: 'Несокрушимый', description: 'Комбо 60 дней подряд', xp: 600, category: 'combo' },
  { id: 'combo_100', icon: '👑', title: 'Легенда', description: 'Комбо 100 дней подряд', xp: 1000, category: 'combo' },

  // 🎯 ЦЕЛИ
  { id: 'first_goal', icon: '🎯', title: 'Первый шаг', description: 'Создана первая цель', xp: 20, category: 'goals' },
  { id: 'goal_completed', icon: '🏆', title: 'Победитель', description: 'Первая цель выполнена', xp: 100, category: 'goals' },
  { id: 'goals_5', icon: '📋', title: 'Планировщик', description: 'Создано 5 целей', xp: 50, category: 'goals' },
  { id: 'goals_3_done', icon: '🎖️', title: 'Достигатель', description: '3 цели выполнены', xp: 200, category: 'goals' },

  // 📝 ЕЖЕДНЕВНИК
  { id: 'first_entry', icon: '📝', title: 'Начало пути', description: 'Первая запись в ежедневнике', xp: 10, category: 'daily' },
  { id: 'entries_7', icon: '📅', title: 'Неделя записей', description: '7 записей в ежедневнике', xp: 50, category: 'daily' },
  { id: 'entries_30', icon: '📚', title: 'Летописец', description: '30 записей в ежедневнике', xp: 150, category: 'daily' },
  { id: 'full_entry', icon: '⭐', title: 'Идеальный день', description: 'Заполнены все поля ежедневника', xp: 40, category: 'daily' },

  // 🛠️ ИНСТРУМЕНТЫ
  { id: 'first_smart', icon: '🧠', title: 'Стратег', description: 'Создан первый PP SMART', xp: 30, category: 'tools' },
  { id: 'first_cascade', icon: '🔗', title: 'Декомпозитор', description: 'Создан первый экшен-каскад', xp: 30, category: 'tools' },
  { id: 'first_descartes', icon: '🔲', title: 'Аналитик', description: 'Пройден Квадрат Декарта', xp: 25, category: 'tools' },
  { id: 'first_eisenhower', icon: '📊', title: 'Приоритизатор', description: 'Использована Матрица Эйзенхауэра', xp: 25, category: 'tools' },
  { id: 'first_3p', icon: '🎯', title: 'Фильтровщик', description: 'Пройден Метод 3П', xp: 25, category: 'tools' },
  { id: 'first_coaching', icon: '💬', title: 'Коуч', description: 'Пройден мини-самокоучинг', xp: 40, category: 'tools' },
  { id: 'all_tools', icon: '🏅', title: 'Мастер инструментов', description: 'Использованы все 4 инструмента оценки', xp: 100, category: 'tools' },

  // ⭐ СПЕЦИАЛЬНЫЕ
  { id: 'first_strategy', icon: '🗺️', title: 'Визионер', description: 'Создана первая стратегия', xp: 20, category: 'special' },
  { id: 'tasks_10', icon: '✅', title: 'Продуктивный', description: 'Выполнено 10 задач', xp: 50, category: 'special' },
  { id: 'tasks_50', icon: '💪', title: 'Машина', description: 'Выполнено 50 задач', xp: 200, category: 'special' },
  { id: 'tasks_100', icon: '🚀', title: 'Ракета', description: 'Выполнено 100 задач', xp: 500, category: 'special' },
]

// ==========================================
// УРОВНИ / РАНГИ (8 штук)
// ==========================================

export interface RankInfo {
  level: number
  title: string
  icon: string
  minXp: number
  maxXp: number
}

const RANKS: RankInfo[] = [
  { level: 1, title: 'Новичок',       icon: '🌱', minXp: 0,    maxXp: 50 },
  { level: 2, title: 'Практик',       icon: '📝', minXp: 50,   maxXp: 150 },
  { level: 3, title: 'Планировщик',   icon: '📋', minXp: 150,  maxXp: 300 },
  { level: 4, title: 'Стратег',       icon: '🎯', minXp: 300,  maxXp: 500 },
  { level: 5, title: 'Профессионал',  icon: '💼', minXp: 500,  maxXp: 800 },
  { level: 6, title: 'Эксперт',       icon: '🏆', minXp: 800,  maxXp: 1200 },
  { level: 7, title: 'Мастер целей',  icon: '👑', minXp: 1200, maxXp: 2000 },
  { level: 8, title: 'Легенда',       icon: '💎', minXp: 2000, maxXp: 9999 },
]

export function getRank(xp: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i]
  }
  return RANKS[0]
}

export function getXpProgress(xp: number): { current: number; needed: number; percent: number } {
  const rank = getRank(xp)
  const current = xp - rank.minXp
  const needed = rank.maxXp - rank.minXp
  const percent = Math.min(100, Math.round((current / needed) * 100))
  return { current, needed, percent }
}

// ==========================================
// ХУК useAchievements
// ==========================================

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([])
  const [totalXp, setTotalXp] = useState(0)
  const [newAchievement, setNewAchievement] = useState<UnlockedAchievement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUnlocked()
  }, [])

  async function loadUnlocked() {
    try {
      const achievements = await db.achievements.toArray()
      const result: UnlockedAchievement[] = []
      let xp = 0

      achievements.forEach(a => {
        if (a.isUnlocked) {
          const def = ACHIEVEMENTS.find(d => d.id === a.type)
          if (def) {
            result.push({ ...def, unlockedAt: a.unlockedAt || '' })
            xp += def.xp
          }
        }
      })

      setUnlocked(result)
      setTotalXp(xp)
    } catch (error) {
      console.error('Ошибка загрузки достижений:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Разблокировать достижение
  const tryUnlock = useCallback(async (achievementId: string): Promise<boolean> => {
    try {
      const existing = await db.achievements
        .where('type')
        .equals(achievementId)
        .first()

      if (existing?.isUnlocked) return false

      const def = ACHIEVEMENTS.find(d => d.id === achievementId)
      if (!def) return false

      const now = new Date().toISOString()

      if (existing) {
        await db.achievements.update(existing.id!, {
          isUnlocked: true,
          unlockedAt: now,
        })
      } else {
        await db.achievements.add({
  type: achievementId,
  title: def.title,
  description: def.description,
  icon: def.icon,
  isUnlocked: true,
  unlockedAt: now,
})
      }

      const newOne: UnlockedAchievement = { ...def, unlockedAt: now }
      setUnlocked(prev => [...prev, newOne])
      setTotalXp(prev => prev + def.xp)
      setNewAchievement(newOne)

      return true
    } catch (error) {
      console.error('Ошибка разблокировки:', error)
      return false
    }
  }, [])

  // Проверка ВСЕХ условий разом
  const checkAll = useCallback(async (comboCount: number) => {
    try {
      const [goals, entries, tasks, smarts, cascadeSteps, descartes, eisenhower, threeP, coaching] = await Promise.all([
        db.goals.toArray(),
        db.dailyEntries.toArray(),
        db.tasks.toArray(),
        db.ppSmarts.toArray(),
        db.actionSteps.toArray(),
        db.descartesSquares.toArray(),
        db.eisenhowerItems.toArray(),
        db.threePResults.toArray(),
        db.coachingSessions.toArray(),
      ])

      const strategies = await db.strategies.toArray()

      // КОМБО
      if (comboCount >= 3) await tryUnlock('combo_3')
      if (comboCount >= 7) await tryUnlock('combo_7')
      if (comboCount >= 14) await tryUnlock('combo_14')
      if (comboCount >= 30) await tryUnlock('combo_30')
      if (comboCount >= 60) await tryUnlock('combo_60')
      if (comboCount >= 100) await tryUnlock('combo_100')

      // ЦЕЛИ
      if (goals.length >= 1) await tryUnlock('first_goal')
      if (goals.length >= 5) await tryUnlock('goals_5')
      const completedGoals = goals.filter(g => g.status === 'completed')
      if (completedGoals.length >= 1) await tryUnlock('goal_completed')
      if (completedGoals.length >= 3) await tryUnlock('goals_3_done')

      // ЕЖЕДНЕВНИК
      if (entries.length >= 1) await tryUnlock('first_entry')
      if (entries.length >= 7) await tryUnlock('entries_7')
      if (entries.length >= 30) await tryUnlock('entries_30')
     const fullEntry = entries.find(e =>
  e.energyLevel && e.energyLevel > 0 &&
        e.morningIntention?.trim() &&
        e.morningGratitude?.trim() &&
        e.eveningWin?.trim() &&
        e.eveningLesson?.trim()
      )
      if (fullEntry) await tryUnlock('full_entry')

      // ИНСТРУМЕНТЫ
      if (smarts.length >= 1) await tryUnlock('first_smart')
      if (cascadeSteps.length >= 1) await tryUnlock('first_cascade')
      if (descartes.length >= 1) await tryUnlock('first_descartes')
      if (eisenhower.length >= 1) await tryUnlock('first_eisenhower')
      if (threeP.length >= 1) await tryUnlock('first_3p')
      const completedCoaching = coaching.filter(c => c.isCompleted)
      if (completedCoaching.length >= 1) await tryUnlock('first_coaching')
      if (descartes.length > 0 && eisenhower.length > 0 && threeP.length > 0 && completedCoaching.length > 0) {
        await tryUnlock('all_tools')
      }

      // СПЕЦИАЛЬНЫЕ
      if (strategies.length >= 1) await tryUnlock('first_strategy')
      const completedTasks = tasks.filter(t => t.status === 'done')
      if (completedTasks.length >= 10) await tryUnlock('tasks_10')
      if (completedTasks.length >= 50) await tryUnlock('tasks_50')
      if (completedTasks.length >= 100) await tryUnlock('tasks_100')

    } catch (error) {
      console.error('Ошибка проверки достижений:', error)
    }
  }, [tryUnlock])

  function dismissNew() {
    setNewAchievement(null)
  }

  const rank = getRank(totalXp)
  const xpProgress = getXpProgress(totalXp)

  return {
    unlocked,
    totalXp,
    rank,
    xpProgress,
    newAchievement,
    dismissNew,
    checkAll,
    tryUnlock,
    isLoading,
    allAchievements: ACHIEVEMENTS,
  }
}