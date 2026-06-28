import { useState } from 'react'
import type { TaskItem } from '../hooks/useDailyEntry'

interface TaskListProps {
  tasks: TaskItem[]
  onAdd: (title: string) => void
  onToggle: (taskId: number) => void
  onDelete: (taskId: number) => void
}

export default function TaskList({ tasks, onAdd, onToggle, onDelete }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')

  function handleAdd() {
    const trimmed = newTaskTitle.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setNewTaskTitle('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  const completedCount = tasks.filter(t => t.isCompleted).length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text">✅ Задачи на день</h2>
        {totalCount > 0 && (
          <span className="text-sm text-text-light">
            {completedCount}/{totalCount} выполнено
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Добавить задачу..."
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-text placeholder-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-bold cursor-pointer"
        >
          +
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-text-light py-4">
          Пока нет задач. Добавьте первую! ☝️
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${task.isCompleted ? 'bg-success/5' : 'hover:bg-bg'}`}
            >
              <button
                onClick={() => onToggle(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${task.isCompleted ? 'bg-success border-success text-white' : 'border-border hover:border-primary'}`}
              >
                {task.isCompleted && <span className="text-xs">✓</span>}
              </button>

              <span className={`flex-1 transition-colors ${task.isCompleted ? 'line-through text-text-light' : 'text-text'}`}>
                {task.title}
              </span>

              <button
                onClick={() => onDelete(task.id)}
                className="text-text-light hover:text-danger transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {totalCount > 0 && (
        <div className="mt-4">
          <div className="w-full bg-bg rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}