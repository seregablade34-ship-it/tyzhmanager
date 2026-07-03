import { useState, useEffect } from 'react'
import { db } from '../db/database'

export interface ComboData {
  currentCombo: number
  maxCombo: number
  todayCompleted: boolean
  isLoading: boolean
}

function isEntryFilled(entry: {
  energy?: number
  morningIntention?: string
  morningGratitude?: string
  eveningWin?: string
  eveningLesson?: string
} | undefined): boolean {
  if (!entry) return false
  return !!(
    (entry.energy && entry.energy > 0) ||
    entry.morningIntention?.trim() ||
    entry.morningGratitude?.trim() ||
    entry.eveningWin?.trim() ||
    entry.eveningLesson?.trim()
  )
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useCombo(): ComboData {
  const [currentCombo, setCurrentCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [todayCompleted, setTodayCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    calculateCombo()
  }, [])

  async function calculateCombo() {
    try {
      const entries = await db.dailyEntries.toArray()
      const filledDates = new Set<string>()
      entries.forEach(entry => {
        if (isEntryFilled(entry)) {
          filledDates.add(entry.date)
        }
      })

      const today = new Date()
      const todayStr = formatDate(today)
      const isTodayFilled = filledDates.has(todayStr)
      setTodayCompleted(isTodayFilled)

      // Считаем текущее комбо
      let combo = 0
      const startDate = new Date(today)

      if (isTodayFilled) {
        combo = 1
        startDate.setDate(startDate.getDate() - 1)
      } else {
        startDate.setDate(startDate.getDate() - 1)
      }

      while (true) {
        const dateStr = formatDate(startDate)
        if (filledDates.has(dateStr)) {
          combo++
          startDate.setDate(startDate.getDate() - 1)
        } else {
          break
        }
      }

      if (!isTodayFilled) {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (!filledDates.has(formatDate(yesterday))) {
          combo = 0
        }
      }

      setCurrentCombo(combo)

      // Максимальное комбо
      const sortedDates = Array.from(filledDates).sort()
      let maxStreak = 0
      let currentStreak = 0

      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          currentStreak = 1
        } else {
          const prevDate = new Date(sortedDates[i - 1])
          const currDate = new Date(sortedDates[i])
          const diffDays = Math.round(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          currentStreak = diffDays === 1 ? currentStreak + 1 : 1
        }
        maxStreak = Math.max(maxStreak, currentStreak)
      }

      setMaxCombo(maxStreak)
    } catch (error) {
      console.error('Ошибка комбо:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { currentCombo, maxCombo, todayCompleted, isLoading }
}