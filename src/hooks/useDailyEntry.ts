import { useState, useEffect, useCallback } from 'react'
import { db } from '../db/database'
import type { DailyEntry, Task } from '../types'

// Тип для задач в UI
export interface TaskItem {
  id: number
  title: string
  isCompleted: boolean
}

// Пустая запись для нового дня
function createEmptyEntry(date: string): DailyEntry {
  const now = new Date().toISOString()
  return {
    date,
    energyLevel: undefined,
    morningIntention: '',
    morningGratitude: '',
    morningPriorities: ['', '', ''],
    eveningWin: '',
    eveningLesson: '',
    eveningTomorrow: '',
    createdAt: now,
    updatedAt: now,
  }
}

// Конвертация задач из БД в UI формат
function dbTasksToUI(tasks: Task[]): TaskItem[] {
  return tasks.map(t => ({
    id: t.id!,
    title: t.title,
    isCompleted: t.isCompleted,
  }))
}

export function useDailyEntry(selectedDate: string) {
  const [entry, setEntry] = useState<DailyEntry>(createEmptyEntry(selectedDate))
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // === ЗАГРУЗКА данных при смене даты ===
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setIsLoading(true)
      try {
        const existing = await db.dailyEntries
          .where('date')
          .equals(selectedDate)
          .first()

        if (cancelled) return

        if (existing) {
          setEntry(existing)
        } else {
          setEntry(createEmptyEntry(selectedDate))
        }

        const dayTasks = await db.tasks
          .where('date')
          .equals(selectedDate)
          .toArray()

        if (cancelled) return
        setTasks(dbTasksToUI(dayTasks))
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        if (!cancelled) {
          setEntry(createEmptyEntry(selectedDate))
          setTasks([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [selectedDate])

  // === СОХРАНЕНИЕ записи дня (debounce 500мс) ===
  useEffect(() => {
    if (isLoading) return

    const timer = setTimeout(async () => {
      try {
        const toSave: DailyEntry = {
          ...entry,
          date: selectedDate,
          updatedAt: new Date().toISOString(),
        }

        // put = создать или полностью заменить (без проблем с массивами)
        await db.dailyEntries.put(toSave)
      } catch (error) {
        console.error('Ошибка сохранения записи:', error)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [entry, isLoading, selectedDate])

  // === ФУНКЦИИ обновления полей ===
  const updateEnergy = useCallback((value: number | undefined) => {
    setEntry(prev => ({ ...prev, energyLevel: value }))
  }, [])

  const updateIntention = useCallback((value: string) => {
    setEntry(prev => ({ ...prev, morningIntention: value }))
  }, [])

  const updateGratitude = useCallback((value: string) => {
    setEntry(prev => ({ ...prev, morningGratitude: value }))
  }, [])

  const updatePriorities = useCallback((value: string[]) => {
    setEntry(prev => ({ ...prev, morningPriorities: value }))
  }, [])

  const updateWin = useCallback((value: string) => {
    setEntry(prev => ({ ...prev, eveningWin: value }))
  }, [])

  const updateLesson = useCallback((value: string) => {
    setEntry(prev => ({ ...prev, eveningLesson: value }))
  }, [])

  const updateTomorrow = useCallback((value: string) => {
    setEntry(prev => ({ ...prev, eveningTomorrow: value }))
  }, [])

  // === ФУНКЦИИ для задач ===
  const addTask = useCallback(async (title: string) => {
    try {
      const now = new Date().toISOString()
      const newTask: Task = {
        title,
        date: selectedDate,
        isCompleted: false,
        priority: 'medium',
        order: tasks.length,
        createdAt: now,
        updatedAt: now,
      }
      const id = await db.tasks.add(newTask)
      setTasks(prev => [...prev, { id: id as number, title, isCompleted: false }])
    } catch (error) {
      console.error('Ошибка добавления задачи:', error)
    }
  }, [selectedDate, tasks.length])

  const toggleTask = useCallback(async (taskId: number) => {
    try {
      const task = await db.tasks.get(taskId)
      if (!task) return

      const newCompleted = !task.isCompleted
      await db.tasks.update(taskId, {
        isCompleted: newCompleted,
        updatedAt: new Date().toISOString(),
      })

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, isCompleted: newCompleted } : t
        )
      )
    } catch (error) {
      console.error('Ошибка переключения задачи:', error)
    }
  }, [])

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await db.tasks.delete(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Ошибка удаления задачи:', error)
    }
  }, [])

  return {
    entry,
    tasks,
    isLoading,
    updateEnergy,
    updateIntention,
    updateGratitude,
    updatePriorities,
    updateWin,
    updateLesson,
    updateTomorrow,
    addTask,
    toggleTask,
    deleteTask,
  }
}