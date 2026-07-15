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
  category: 'combo' | 'goals' | 'daily' | 'perfect' | 'tools' | 'special' | 'secret'
}

export interface UnlockedAchievement extends AchievementDef {
  unlockedAt: string
}

// ВСЕ ДОСТИЖЕНИЯ (48 штук) — ГЕЙМИФИКАЦИЯ v2
export const ACHIEVEMENTS: AchievementDef[] = [

  // ═══════════════════════════════════════
  // 🔥 КОМБО (8 штук)
  // ═══════════════════════════════════════
  { id: 'combo_3',   icon: '🔥', title: 'Разогрев',              description: 'Комбо 3 дня подряд',   xp: 10, category: 'combo' },
  { id: 'combo_7',   icon: '🔥', title: 'Неделя огня',           description: 'Комбо 7 дней подряд',  xp: 20, category: 'combo' },
  { id: 'combo_14',  icon: '🔥', title: 'Двухнедельный марафон', description: 'Комбо 14 дней подряд', xp: 35, category: 'combo' },
  { id: 'combo_30',  icon: '🌟', title: 'Месяц дисциплины',     description: 'Комбо 30 дней подряд', xp: 60, category: 'combo' },
  { id: 'combo_60',  icon: '💎', title: 'Несокрушимый',          description: 'Комбо 60 дней подряд', xp: 100, category: 'combo' },
  { id: 'combo_100', icon: '👑', title: 'Легенда',               description: 'Комбо 100 дней подряд', xp: 150, category: 'combo' },
  { id: 'combo_180', icon: '🏔️', title: 'Полугодие силы',        description: 'Комбо 180 дней подряд', xp: 250, category: 'combo' },
  { id: 'combo_365', icon: '🌍', title: 'Год дисциплины',        description: 'Комбо 365 дней подряд', xp: 500, category: 'combo' },

  // ═══════════════════════════════════════
  // 🎯 ЦЕЛИ (6 штук)
  // ═══════════════════════════════════════
  { id: 'first_goal',      icon: '🎯', title: 'Первый шаг',    description: 'Создана первая цель',     xp: 10, category: 'goals' },
  { id: 'goal_completed',  icon: '🏆', title: 'Победитель',     description: 'Первая цель выполнена',   xp: 30, category: 'goals' },
  { id: 'goals_5',         icon: '📋', title: 'Планировщик',    description: 'Создано 5 целей',         xp: 20, category: 'goals' },
  { id: 'goals_10',        icon: '📚', title: 'Целеустремлённый', description: 'Создано 10 целей',      xp: 40, category: 'goals' },
  { id: 'goals_3_done',    icon: '🎖️', title: 'Достигатель',    description: '3 цели выполнены',        xp: 60, category: 'goals' },
  { id: 'goals_10_done',   icon: '💎', title: 'Мастер целей',   description: '10 целей выполнены',      xp: 150, category: 'goals' },

  // ═══════════════════════════════════════
  // 📝 ЕЖЕДНЕВНИК (7 штук)
  // ═══════════════════════════════════════
  { id: 'first_entry',  icon: '📝', title: 'Начало пути',     description: 'Первая запись в ежедневнике',  xp: 5,   category: 'daily' },
  { id: 'entries_7',    icon: '📅', title: 'Неделя записей',   description: '7 записей в ежедневнике',     xp: 15,  category: 'daily' },
  { id: 'entries_30',   icon: '📚', title: 'Летописец',        description: '30 записей в ежедневнике',    xp: 40,  category: 'daily' },
  { id: 'entries_100',  icon: '📖', title: 'Хроникёр',         description: '100 записей в ежедневнике',   xp: 80,  category: 'daily' },
  { id: 'entries_180',  icon: '🏛️', title: 'Полугодие записей', description: '180 записей в ежедневнике', xp: 130, category: 'daily' },
  { id: 'entries_365',  icon: '🌟', title: 'Год рефлексии',    description: '365 записей в ежедневнике',   xp: 250, category: 'daily' },
  { id: 'full_entry',   icon: '⭐', title: 'Идеальная запись',  description: 'Заполнены все поля ежедневника', xp: 15, category: 'daily' },

  // ═══════════════════════════════════════
  // ✨ ИДЕАЛЬНЫЙ ДЕНЬ — все задачи выполнены (7 штук)
  // ═══════════════════════════════════════
  { id: 'perfect_1',   icon: '✨', title: 'Первый идеальный день', description: 'Все задачи дня выполнены',       xp: 10, category: 'perfect' },
  { id: 'perfect_7',   icon: '🌟', title: 'Идеальная неделя',     description: '7 идеальных дней',                xp: 30, category: 'perfect' },
  { id: 'perfect_30',  icon: '💫', title: 'Идеальный месяц',      description: '30 идеальных дней',               xp: 60, category: 'perfect' },
  { id: 'perfect_60',  icon: '🔥', title: 'Два месяца совершенства', description: '60 идеальных дней',            xp: 100, category: 'perfect' },
  { id: 'perfect_100', icon: '💎', title: '100 дней без провалов', description: '100 идеальных дней',              xp: 160, category: 'perfect' },
  { id: 'perfect_180', icon: '👑', title: 'Полугодие мастерства',  description: '180 идеальных дней',              xp: 250, category: 'perfect' },
  { id: 'perfect_365', icon: '🏆', title: 'Год совершенства',     description: '365 идеальных дней',              xp: 500, category: 'perfect' },

  // ═══════════════════════════════════════
  // 🛠️ ИНСТРУМЕНТЫ (9 штук — без Эйзенхауэра)
  // ═══════════════════════════════════════
  { id: 'first_smart',       icon: '🧠', title: 'Стратег',             description: 'Создан первый PP SMART',              xp: 10, category: 'tools' },
  { id: 'smart_3',           icon: '🧠', title: 'SMART-мастер',        description: 'Создано 3 PP SMART',                  xp: 25, category: 'tools' },
  { id: 'first_cascade',     icon: '🔗', title: 'Декомпозитор',        description: 'Создан первый экшен-каскад',          xp: 10, category: 'tools' },
  { id: 'cascade_3',         icon: '🔗', title: 'Каскадёр',            description: 'Создано 3 экшен-каскада',             xp: 25, category: 'tools' },
  { id: 'first_descartes',   icon: '🔲', title: 'Аналитик',            description: 'Пройден Квадрат Декарта',             xp: 10, category: 'tools' },
  { id: 'descartes_5',       icon: '🔲', title: 'Гроссмейстер анализа', description: 'Пройдено 5 Квадратов Декарта',       xp: 30, category: 'tools' },
  { id: 'first_3p',          icon: '🎯', title: 'Фильтровщик',        description: 'Пройден Метод 3П',                    xp: 10, category: 'tools' },
  { id: 'first_coaching',    icon: '💬', title: 'Коуч',                description: 'Пройден мини-самокоучинг',            xp: 15, category: 'tools' },
  { id: 'all_tools',         icon: '🏅', title: 'Мастер инструментов', description: 'Использованы все 5 инструментов',     xp: 50, category: 'tools' },

  // ═══════════════════════════════════════
  // ⭐ СПЕЦИАЛЬНЫЕ (10 штук)
  // ═══════════════════════════════════════
  { id: 'first_strategy',   icon: '🗺️', title: 'Визионер',           description: 'Создана первая стратегия',    xp: 10, category: 'special' },
  { id: 'strategies_5',     icon: '🗺️', title: 'Архитектор будущего', description: 'Создано 5 стратегий',         xp: 40, category: 'special' },
  { id: 'tasks_10',         icon: '✅', title: 'Продуктивный',        description: 'Выполнено 10 задач',          xp: 15, category: 'special' },
  { id: 'tasks_50',         icon: '💪', title: 'Машина',              description: 'Выполнено 50 задач',          xp: 40, category: 'special' },
  { id: 'tasks_100',        icon: '🚀', title: 'Ракета',              description: 'Выполнено 100 задач',         xp: 80, category: 'special' },
  { id: 'tasks_500',        icon: '⚡', title: 'Молния',              description: 'Выполнено 500 задач',         xp: 200, category: 'special' },
  { id: 'tasks_1000',       icon: '🌍', title: 'Титан',               description: 'Выполнено 1000 задач',        xp: 400, category: 'special' },
  { id: 'transfer_first',   icon: '📦', title: 'Гибкий планировщик',  description: 'Первый перенос задачи',       xp: 10, category: 'special' },
  { id: 'transfer_10',      icon: '📦', title: 'Адаптивный',          description: '10 переносов задач',          xp: 25, category: 'special' },
  { id: 'early_bird',       icon: '🌅', title: 'Ранняя пташка',       description: 'Запись до 7:00 утра',         xp: 15, category: 'special' },

  // 🏆 СЕКРЕТНОЕ — открывается при получении ВСЕХ остальных бейджей
  { id: 'secret_tyzhmanager', icon: '🔮', title: '#тыжменеджер', description: 'Секретное достижение', xp: 0, category: 'secret' },
]

// ==========================================
// УРОВНИ / РАНГИ (10 штук) — растянутые
// ==========================================

export interface RankInfo {
  level: number
  title: string
  icon: string
  minXp: number
  maxXp: number
}

const RANKS: RankInfo[] = [
  { level: 1,  title: 'Новичок',       icon: '🌱', minXp: 0,    maxXp: 30 },
  { level: 2,  title: 'Практик',       icon: '📝', minXp: 30,   maxXp: 80 },
  { level: 3,  title: 'Планировщик',   icon: '📋', minXp: 80,   maxXp: 160 },
  { level: 4,  title: 'Стратег',       icon: '🎯', minXp: 160,  maxXp: 300 },
  { level: 5,  title: 'Профессионал',  icon: '💼', minXp: 300,  maxXp: 500 },
  { level: 6,  title: 'Эксперт',       icon: '🏆', minXp: 500,  maxXp: 800 },
  { level: 7,  title: 'Мастер',        icon: '⚡', minXp: 800,  maxXp: 1200 },
  { level: 8,  title: 'Грандмастер',   icon: '👑', minXp: 1200, maxXp: 2000 },
  { level: 9,  title: 'Легенда',       icon: '💎', minXp: 2000, maxXp: 3500 },
  { level: 10, title: 'Титан',         icon: '🌍', minXp: 3500, maxXp: 9999 },
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
// ПОДСЧЁТ ИДЕАЛЬНЫХ ДНЕЙ
// ==========================================

async function countPerfectDays(): Promise<number> {
  try {
    const entries = await db.dailyEntries.toArray()
    const tasks = await db.tasks.toArray()

    let perfectCount = 0

    for (const entry of entries) {
      const dayTasks = tasks.filter(t => t.date === entry.date)
      if (dayTasks.length > 0 && dayTasks.every(t => t.status === 'done')) {
        perfectCount++
      }
    }

    return perfectCount
  } catch {
    return 0
  }
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

  // Проверка ВСЕХ условий
  const checkAll = useCallback(async (comboCount: number) => {
    try {
      const [goals, entries, tasks, smarts, cascadeSteps, descartes, threeP, coaching] = await Promise.all([
        db.goals.toArray(),
        db.dailyEntries.toArray(),
        db.tasks.toArray(),
        db.ppSmarts.toArray(),
        db.actionSteps.toArray(),
        db.descartesSquares.toArray(),
        db.threePResults.toArray(),
        db.coachingSessions.toArray(),
      ])

      const strategies = await db.strategies.toArray()
      const transfers = await db.taskTransfers.toArray()

      // 🔥 КОМБО
      if (comboCount >= 3)   await tryUnlock('combo_3')
      if (comboCount >= 7)   await tryUnlock('combo_7')
      if (comboCount >= 14)  await tryUnlock('combo_14')
      if (comboCount >= 30)  await tryUnlock('combo_30')
      if (comboCount >= 60)  await tryUnlock('combo_60')
      if (comboCount >= 100) await tryUnlock('combo_100')
      if (comboCount >= 180) await tryUnlock('combo_180')
      if (comboCount >= 365) await tryUnlock('combo_365')

      // 🎯 ЦЕЛИ
      if (goals.length >= 1)  await tryUnlock('first_goal')
      if (goals.length >= 5)  await tryUnlock('goals_5')
      if (goals.length >= 10) await tryUnlock('goals_10')
      const completedGoals = goals.filter(g => g.status === 'completed')
      if (completedGoals.length >= 1)  await tryUnlock('goal_completed')
      if (completedGoals.length >= 3)  await tryUnlock('goals_3_done')
      if (completedGoals.length >= 10) await tryUnlock('goals_10_done')

      // 📝 ЕЖЕДНЕВНИК
      if (entries.length >= 1)   await tryUnlock('first_entry')
      if (entries.length >= 7)   await tryUnlock('entries_7')
      if (entries.length >= 30)  await tryUnlock('entries_30')
      if (entries.length >= 100) await tryUnlock('entries_100')
      if (entries.length >= 180) await tryUnlock('entries_180')
      if (entries.length >= 365) await tryUnlock('entries_365')

      const fullEntry = entries.find(e =>
        e.energyLevel && e.energyLevel > 0 &&
        e.morningIntention?.trim() &&
        e.morningGratitude?.trim() &&
        e.eveningWin?.trim() &&
        e.eveningLesson?.trim()
      )
      if (fullEntry) await tryUnlock('full_entry')

      // ✨ ИДЕАЛЬНЫЕ ДНИ
      const perfectDays = await countPerfectDays()
      if (perfectDays >= 1)   await tryUnlock('perfect_1')
      if (perfectDays >= 7)   await tryUnlock('perfect_7')
      if (perfectDays >= 30)  await tryUnlock('perfect_30')
      if (perfectDays >= 60)  await tryUnlock('perfect_60')
      if (perfectDays >= 100) await tryUnlock('perfect_100')
      if (perfectDays >= 180) await tryUnlock('perfect_180')
      if (perfectDays >= 365) await tryUnlock('perfect_365')

      // 🛠️ ИНСТРУМЕНТЫ
      if (smarts.length >= 1) await tryUnlock('first_smart')
      if (smarts.length >= 3) await tryUnlock('smart_3')

      // Каскады — считаем уникальные goalId
      const uniqueCascadeGoals = new Set(cascadeSteps.map(s => s.goalId)).size
      if (uniqueCascadeGoals >= 1) await tryUnlock('first_cascade')
      if (uniqueCascadeGoals >= 3) await tryUnlock('cascade_3')

      if (descartes.length >= 1) await tryUnlock('first_descartes')
      if (descartes.length >= 5) await tryUnlock('descartes_5')
      if (threeP.length >= 1) await tryUnlock('first_3p')

      const completedCoaching = coaching.filter(c => c.isCompleted)
      if (completedCoaching.length >= 1) await tryUnlock('first_coaching')

      // Все 5 инструментов: SMART + Каскад + Декарт + 3П + Коучинг
      if (smarts.length > 0 && uniqueCascadeGoals > 0 && descartes.length > 0 && threeP.length > 0 && completedCoaching.length > 0) {
        await tryUnlock('all_tools')
      }

      // ⭐ СПЕЦИАЛЬНЫЕ
      if (strategies.length >= 1) await tryUnlock('first_strategy')
      if (strategies.length >= 5) await tryUnlock('strategies_5')

      const completedTasks = tasks.filter(t => t.status === 'done')
      if (completedTasks.length >= 10)   await tryUnlock('tasks_10')
      if (completedTasks.length >= 50)   await tryUnlock('tasks_50')
      if (completedTasks.length >= 100)  await tryUnlock('tasks_100')
      if (completedTasks.length >= 500)  await tryUnlock('tasks_500')
      if (completedTasks.length >= 1000) await tryUnlock('tasks_1000')

      if (transfers.length >= 1)  await tryUnlock('transfer_first')
      if (transfers.length >= 10) await tryUnlock('transfer_10')

      // Ранняя пташка — запись до 7:00
      const earlyEntry = entries.find(e => {
        if (!e.updatedAt) return false
        const hour = new Date(e.updatedAt).getHours()
        return hour < 7
      })
      if (earlyEntry) await tryUnlock('early_bird')

      // 🏆 СЕКРЕТНОЕ: все бейджи (кроме самого секретного) открыты
      const allNonSecret = ACHIEVEMENTS.filter(a => a.category !== 'secret')
      const unlockedAll = await db.achievements.toArray()
      const unlockedIds = new Set(unlockedAll.filter(a => a.isUnlocked).map(a => a.type))
      const allRegularUnlocked = allNonSecret.every(a => unlockedIds.has(a.id))
      if (allRegularUnlocked) await tryUnlock('secret_tyzhmanager')

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