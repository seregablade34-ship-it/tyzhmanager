import { useState, useEffect, useCallback } from 'react'
import { db } from '../db/database'
import type { DailyEntry, Task, TaskStatus, TaskPriority, TaskTag } from '../types'

// Подзадача для UI
export interface SubTaskItem {
  id: string
  title: string
  isCompleted: boolean
}

// Задача для UI
export interface TaskItem {
  id: number
  title: string
  status: TaskStatus
  priority: TaskPriority
  tag?: TaskTag
  subtasks: SubTaskItem[]
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
function dbTaskToUI(t: Task): TaskItem {
  return {
    id: t.id!,
    title: t.title,
    status: t.status || 'not-started',
    priority: t.priority || 'medium',
    tag: t.tag,
    subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
  }
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
        setTasks(dayTasks.map(dbTaskToUI))
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

  // Добавить задачу
  const addTask = useCallback(async (title: string) => {
    try {
      const now = new Date().toISOString()
      const newTask: Task = {
        title,
        date: selectedDate,
        status: 'not-started',
        priority: 'medium',
        subtasks: [],
        order: tasks.length,
        createdAt: now,
        updatedAt: now,
      }
      const id = await db.tasks.add(newTask)
      setTasks(prev => [...prev, {
        id: id as number,
        title,
        status: 'not-started',
        priority: 'medium',
        subtasks: [],
      }])
    } catch (error) {
      console.error('Ошибка добавления задачи:', error)
    }
  }, [selectedDate, tasks.length])

  // Сменить статус
  const updateTaskStatus = useCallback(async (taskId: number, status: TaskStatus) => {
    try {
      await db.tasks.update(taskId, {
        status,
        updatedAt: new Date().toISOString(),
      })
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status } : t)
      )
    } catch (error) {
      console.error('Ошибка смены статуса:', error)
    }
  }, [])

  // Сменить приоритет
  const updateTaskPriority = useCallback(async (taskId: number, priority: TaskPriority) => {
    try {
      await db.tasks.update(taskId, {
        priority,
        updatedAt: new Date().toISOString(),
      })
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, priority } : t)
      )
    } catch (error) {
      console.error('Ошибка смены приоритета:', error)
    }
  }, [])

  // Сменить тег
  const updateTaskTag = useCallback(async (taskId: number, tag: TaskTag | undefined) => {
    try {
      await db.tasks.update(taskId, {
        tag,
        updatedAt: new Date().toISOString(),
      })
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, tag } : t)
      )
    } catch (error) {
      console.error('Ошибка смены тега:', error)
    }
  }, [])

  // Удалить задачу
  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await db.tasks.delete(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Ошибка удаления задачи:', error)
    }
  }, [])

// Восстановить удалённую задачу
  const restoreTask = useCallback(async (taskData: {
    title: string
    status: TaskStatus
    priority: TaskPriority
    tag?: TaskTag
    subtasks: SubTaskItem[]
  }) => {
    try {
      const now = new Date().toISOString()
      const newTask: Task = {
        title: taskData.title,
        date: selectedDate,
        status: taskData.status,
        priority: taskData.priority,
        tag: taskData.tag,
        subtasks: taskData.subtasks || [],
        order: tasks.length,
        createdAt: now,
        updatedAt: now,
      }
      const id = await db.tasks.add(newTask)
      setTasks(prev => [...prev, {
        id: id as number,
        title: taskData.title,
        status: taskData.status,
        priority: taskData.priority,
        tag: taskData.tag,
        subtasks: taskData.subtasks || [],
      }])
    } catch (error) {
      console.error('Ошибка восстановления задачи:', error)
    }
  }, [selectedDate, tasks.length])

  // Добавить подзадачу
  const addSubtask = useCallback(async (taskId: number, title: string) => {
    try {
      const task = await db.tasks.get(taskId)
      if (!task) return

      const newSubtask: SubTaskItem = {
        id: crypto.randomUUID(),
        title,
        isCompleted: false,
      }

      const updatedSubtasks = [...(task.subtasks || []), newSubtask]
      await db.tasks.update(taskId, {
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString(),
      })

      setTasks(prev =>
        prev.map(t => t.id === taskId
          ? { ...t, subtasks: [...(t.subtasks || []), newSubtask] }
          : t
        )
      )
    } catch (error) {
      console.error('Ошибка добавления подзадачи:', error)
    }
  }, [])

  // Переключить подзадачу
  const toggleSubtask = useCallback(async (taskId: number, subtaskId: string) => {
    try {
      const task = await db.tasks.get(taskId)
      if (!task) return

      const updatedSubtasks = (task.subtasks || []).map(s =>
        s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
      )

      await db.tasks.update(taskId, {
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString(),
      })

      setTasks(prev =>
        prev.map(t => t.id === taskId
          ? { ...t, subtasks: updatedSubtasks }
          : t
        )
      )
    } catch (error) {
      console.error('Ошибка переключения подзадачи:', error)
    }
  }, [])

  // Удалить подзадачу
  const deleteSubtask = useCallback(async (taskId: number, subtaskId: string) => {
    try {
      const task = await db.tasks.get(taskId)
      if (!task) return

      const updatedSubtasks = (task.subtasks || []).filter(s => s.id !== subtaskId)

      await db.tasks.update(taskId, {
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString(),
      })

      setTasks(prev =>
        prev.map(t => t.id === taskId
          ? { ...t, subtasks: updatedSubtasks }
          : t
        )
      )
    } catch (error) {
      console.error('Ошибка удаления подзадачи:', error)
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
    updateTaskStatus,
    updateTaskPriority,
    updateTaskTag,
    deleteTask,
    restoreTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  }
}