import { useState } from 'react'

// Тип задачи (локальный, пока без базы данных)
interface TaskItem {
  id: number
  title: string
  isCompleted: boolean
}

interface TaskListProps {
  tasks: TaskItem[]
  onTasksChange: (tasks: TaskItem[]) => void
}

export default function TaskList({ tasks, onTasksChange }: TaskListProps) {
  const [newTaskText, setNewTaskText] = useState('')

  // Добавить новую задачу
  function addTask() {
    const text = newTaskText.trim()
    if (!text) return

    const newTask: TaskItem = {
      id: Date.now(),
      title: text,
      isCompleted: false,
    }

    onTasksChange([...tasks, newTask])
    setNewTaskText('')
  }

  // Обработка Enter в поле ввода
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      addTask()
    }
  }

  // Переключить выполнение задачи
  function toggleTask(id: number) {
    const updated = tasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    )
    onTasksChange(updated)
  }

  // Удалить задачу
  function deleteTask(id: number) {
    const updated = tasks.filter(task => task.id !== id)
    onTasksChange(updated)
  }

  // Счётчики
  const completedCount = tasks.filter(t => t.isCompleted).length
  const totalCount = tasks.length

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      {/* Заголовок и счётчик */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text">✅ Задачи на день</h2>
        {totalCount > 0 && (
          <span className="text-sm text-text-light">
            {completedCount}/{totalCount} выполнено
          </span>
        )}
      </div>

      {/* Поле ввода новой задачи */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Добавить задачу..."
          className="flex-1 px-3 py-2 rounded-lg border border-border
                     bg-bg text-text placeholder-text-light/50
                     focus:outline-none focus:ring-2 focus:ring-primary/30
                     focus:border-primary transition-colors"
        />
        <button
          onClick={addTask}
          className="px-4 py-2 bg-primary text-white rounded-lg
                     hover:bg-primary-dark transition-colors cursor-pointer
                     font-medium"
        >
          ＋
        </button>
      </div>

      {/* Список задач */}
      {tasks.length === 0 ? (
        <p className="text-sm text-text-light text-center py-4">
          Пока нет задач. Добавьте первую! ☝️
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg border
                         transition-all duration-200
                ${task.isCompleted
                  ? 'bg-success/5 border-success/20'
                  : 'bg-bg border-border'
                }`}
            >
              {/* Чекбокс */}
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-md border-2 flex items-center
                           justify-center cursor-pointer transition-all
                  ${task.isCompleted
                    ? 'bg-success border-success text-white'
                    : 'border-border hover:border-primary'
                  }`}
              >
                {task.isCompleted && '✓'}
              </button>

              {/* Текст задачи */}
              <span
                className={`flex-1 text-sm transition-all
                  ${task.isCompleted
                    ? 'line-through text-text-light'
                    : 'text-text'
                  }`}
              >
                {task.title}
              </span>

              {/* Кнопка удаления */}
              <button
                onClick={() => deleteTask(task.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md
                           text-text-light hover:text-danger hover:bg-danger/10
                           transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Прогресс-бар */}
      {totalCount > 0 && (
        <div className="mt-4">
          <div className="h-2 bg-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}