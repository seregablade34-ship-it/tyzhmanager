import { useState } from 'react'
import type { TaskItem } from '../hooks/useDailyEntry'
import type { TaskStatus, TaskPriority, TaskTag, TransferReason } from '../types'
import TaskTransferModal from './TaskTransferModal'

interface ImportGoal {
  id: number
  title: string
  sphere: string
}

interface TaskListProps {
  tasks: TaskItem[]
  currentDate: string // YYYY-MM-DD — нужен для переноса
  onAdd: (title: string) => void
  onUpdateStatus: (taskId: number, status: TaskStatus) => void
  onUpdatePriority: (taskId: number, priority: TaskPriority) => void
  onUpdateTag: (taskId: number, tag: TaskTag | undefined) => void
  onDelete: (taskId: number) => void
  onAddSubtask: (taskId: number, title: string) => void
  onToggleSubtask: (taskId: number, subtaskId: string) => void
  onDeleteSubtask: (taskId: number, subtaskId: string) => void
  onTransferTask?: (taskId: number, data: {
    toDate: string
    type: 'move' | 'duplicate'
    reason: TransferReason
    comment?: string
  }) => void
  importGoals?: ImportGoal[]
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: string; color: string }> = {
  'not-started': { label: 'Не начато', icon: '⬜', color: 'text-text-light' },
  'planned':     { label: 'Запланировано', icon: '📋', color: 'text-blue-500' },
  'in-progress': { label: 'В процессе', icon: '🔄', color: 'text-warning' },
  'done':        { label: 'Готово', icon: '✅', color: 'text-success' },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; icon: string; color: string }> = {
  'high':   { label: 'Высокий', icon: '🔴', color: 'border-l-danger' },
  'medium': { label: 'Средний', icon: '🟡', color: 'border-l-warning' },
  'low':    { label: 'Низкий', icon: '🟢', color: 'border-l-success' },
}

const TAG_CONFIG: Record<TaskTag, { label: string; icon: string; bg: string }> = {
  'focus':    { label: 'Фокус', icon: '🎯', bg: 'bg-red-50 text-red-700' },
  'goal':     { label: 'Цель', icon: '⭐', bg: 'bg-amber-50 text-amber-700' },
  'control':  { label: 'Контроль', icon: '📊', bg: 'bg-blue-50 text-blue-700' },
  'routine':  { label: 'Рутина', icon: '🔁', bg: 'bg-gray-50 text-gray-700' },
  'personal': { label: 'Личное', icon: '💜', bg: 'bg-purple-50 text-purple-700' },
}

const STATUS_ORDER: TaskStatus[] = ['not-started', 'planned', 'in-progress', 'done']

export default function TaskList({
  tasks, currentDate, onAdd, onUpdateStatus, onUpdatePriority, onUpdateTag,
  onDelete, onAddSubtask, onToggleSubtask, onDeleteSubtask,
  onTransferTask, importGoals,
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [statusDropdown, setStatusDropdown] = useState<number | null>(null)
  // Перенос
  const [transferTaskId, setTransferTaskId] = useState<number | null>(null)
  const [transferTaskTitle, setTransferTaskTitle] = useState('')

  function handleAdd() {
    const trimmed = newTaskTitle.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setNewTaskTitle('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd()
  }

  function handleStatusSelect(taskId: number, status: TaskStatus) {
    onUpdateStatus(taskId, status)
    setStatusDropdown(null)
  }

  function handleAddSubtask(taskId: number) {
    const trimmed = newSubtaskTitle.trim()
    if (!trimmed) return
    onAddSubtask(taskId, trimmed)
    setNewSubtaskTitle('')
  }

  function handleImportGoal(goal: ImportGoal) {
    onAdd(`📋 ${goal.title}`)
    setShowImport(false)
  }

  function openTransferModal(task: TaskItem) {
    setTransferTaskId(task.id)
    setTransferTaskTitle(task.title)
  }

  const doneCount = tasks.filter(t => t.status === 'done').length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text">✅ Задачи на день</h2>
        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <span className="text-sm text-text-light">
              {doneCount}/{totalCount} выполнено
            </span>
          )}
        </div>
      </div>

      {/* Добавление задачи */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Добавить задачу..."
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-text
                     placeholder-text-light/50 focus:outline-none focus:ring-2
                     focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {/* Кнопка импорта из целей */}
        {importGoals && importGoals.length > 0 && (
          <button
            onClick={() => setShowImport(!showImport)}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm
                       ${showImport
                         ? 'bg-warning/20 text-warning'
                         : 'bg-bg text-text-light hover:bg-border hover:text-text border border-border'
                       }`}
            title="Импорт из целей на год"
          >
            📥
          </button>
        )}
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark
                     transition-colors font-bold cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Панель импорта из целей */}
      {showImport && importGoals && importGoals.length > 0 && (
        <div className="bg-bg border border-warning/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-text-light">
              📥 Создать задачу из цели на год:
            </p>
            <button
              onClick={() => setShowImport(false)}
              className="text-xs text-text-light hover:text-text cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid gap-1.5 max-h-40 overflow-y-auto">
            {importGoals.map(goal => (
              <button
                key={goal.id}
                onClick={() => handleImportGoal(goal)}
                className="w-full text-left px-3 py-2 rounded-lg bg-surface
                           hover:bg-primary/10 hover:text-primary
                           transition-colors cursor-pointer text-sm
                           flex items-center justify-between"
              >
                <span>{goal.title}</span>
                <span className="text-xs text-text-light">{goal.sphere}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Пустое состояние */}
      {tasks.length === 0 ? (
        <p className="text-center text-text-light py-4">
          Пока нет задач. Добавьте первую! ☝️
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => {
            const subtasks = task.subtasks || []
            const statusCfg = STATUS_CONFIG[task.status || 'not-started']
            const priorityCfg = PRIORITY_CONFIG[task.priority || 'medium']
            const tagCfg = task.tag ? TAG_CONFIG[task.tag] : null
            const isExpanded = expandedTask === task.id
            const completedSubs = subtasks.filter(s => s.isCompleted).length
            const isDropdownOpen = statusDropdown === task.id

            return (
              <div key={task.id} className={`border-l-4 ${priorityCfg.color} rounded-lg border border-border overflow-visible relative ${isDropdownOpen ? 'z-50' : 'z-0'}`}>
                {/* Основная строка задачи */}
                <div className={`flex items-center gap-2 p-3 ${task.status === 'done' ? 'bg-success/5' : 'hover:bg-bg'} transition-colors`}>

                  {/* Кнопка статуса с DROPDOWN */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setStatusDropdown(isDropdownOpen ? null : task.id)}
                      className="cursor-pointer text-lg"
                      title={`${statusCfg.label} → клик для выбора`}
                    >
                      {statusCfg.icon}
                    </button>

                    {/* Выпадающий список статусов */}
                    {isDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setStatusDropdown(null)}
                        />
                        <div className="absolute left-0 top-8 z-50 bg-surface border border-border
                                        rounded-lg shadow-lg py-1 min-w-[180px]">
                          {STATUS_ORDER.map(s => {
                            const cfg = STATUS_CONFIG[s]
                            const isActive = (task.status || 'not-started') === s
                            return (
                              <button
                                key={s}
                                onClick={() => handleStatusSelect(task.id, s)}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2
                                           transition-colors cursor-pointer
                                  ${isActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-text hover:bg-bg'
                                  }`}
                              >
                                <span className="text-base">{cfg.icon}</span>
                                <span>{cfg.label}</span>
                                {isActive && <span className="ml-auto text-primary text-xs">✓</span>}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Название */}
                  <span className={`flex-1 ${task.status === 'done' ? 'line-through text-text-light' : 'text-text'}`}>
                    {task.title}
                  </span>

                  {/* Тег */}
                  {tagCfg && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tagCfg.bg}`}>
                      {tagCfg.icon} {tagCfg.label}
                    </span>
                  )}

                  {/* Подзадачи индикатор */}
                  {subtasks.length > 0 && (
                    <span className="text-xs text-text-light">
                      {completedSubs}/{subtasks.length}
                    </span>
                  )}

                  {/* Перенос/дубль */}
                  {onTransferTask && (
                    <button
                      onClick={() => openTransferModal(task)}
                      className="text-text-light hover:text-primary transition-colors cursor-pointer text-sm"
                      title="Перенести / дублировать"
                    >
                      📦
                    </button>
                  )}

                  {/* Раскрыть */}
                  <button
                    onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                    className="text-text-light hover:text-text cursor-pointer text-sm"
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>

                  {/* Удалить */}
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-text-light hover:text-danger transition-colors cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Раскрытая панель */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 bg-bg/50 border-t border-border">
                    {/* Перенос/дубль кнопки в раскрытой панели */}
                    {onTransferTask && (
                      <div className="mb-3">
                        <p className="text-xs text-text-light mb-1">Действия:</p>
                        <button
                          onClick={() => openTransferModal(task)}
                          className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors
                                     bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        >
                          📦 Перенести / 📋 Дублировать
                        </button>
                      </div>
                    )}

                    {/* Управление статусом */}
                    <div className="mb-3">
                      <p className="text-xs text-text-light mb-1">Статус:</p>
                      <div className="flex gap-1 flex-wrap">
                        {STATUS_ORDER.map(s => (
                          <button
                            key={s}
                            onClick={() => onUpdateStatus(task.id, s)}
                            className={`text-xs px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                              task.status === s
                                ? 'bg-primary text-white'
                                : 'bg-bg border border-border hover:bg-surface text-text-light'
                            }`}
                          >
                            {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Управление приоритетом */}
                    <div className="mb-3">
                      <p className="text-xs text-text-light mb-1">Приоритет:</p>
                      <div className="flex gap-1">
                        {(['high', 'medium', 'low'] as TaskPriority[]).map(p => (
                          <button
                            key={p}
                            onClick={() => onUpdatePriority(task.id, p)}
                            className={`text-xs px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                              task.priority === p
                                ? 'bg-primary text-white'
                                : 'bg-bg border border-border hover:bg-surface text-text-light'
                            }`}
                          >
                            {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Управление тегом */}
                    <div className="mb-3">
                      <p className="text-xs text-text-light mb-1">Тег:</p>
                      <div className="flex gap-1 flex-wrap">
                        <button
                          onClick={() => onUpdateTag(task.id, undefined)}
                          className={`text-xs px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                            !task.tag
                              ? 'bg-primary text-white'
                              : 'bg-bg border border-border hover:bg-surface text-text-light'
                          }`}
                        >
                          Без тега
                        </button>
                        {(Object.keys(TAG_CONFIG) as TaskTag[]).map(t => (
                          <button
                            key={t}
                            onClick={() => onUpdateTag(task.id, t)}
                            className={`text-xs px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                              task.tag === t
                                ? 'bg-primary text-white'
                                : 'bg-bg border border-border hover:bg-surface text-text-light'
                            }`}
                          >
                            {TAG_CONFIG[t].icon} {TAG_CONFIG[t].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Подзадачи */}
                    <div>
                      <p className="text-xs text-text-light mb-1">Подзадачи:</p>
                      {subtasks.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {subtasks.map(sub => (
                            <div key={sub.id} className="flex items-center gap-2">
                              <button
                                onClick={() => onToggleSubtask(task.id, sub.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer flex-shrink-0 ${
                                  sub.isCompleted
                                    ? 'bg-success border-success text-white'
                                    : 'border-border hover:border-primary'
                                }`}
                              >
                                {sub.isCompleted && <span className="text-[10px]">✓</span>}
                              </button>
                              <span className={`flex-1 text-sm ${sub.isCompleted ? 'line-through text-text-light' : 'text-text'}`}>
                                {sub.title}
                              </span>
                              <button
                                onClick={() => onDeleteSubtask(task.id, sub.id)}
                                className="text-text-light hover:text-danger cursor-pointer text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={expandedTask === task.id ? newSubtaskTitle : ''}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(task.id) }}
                          placeholder="Добавить подзадачу..."
                          className="flex-1 px-2 py-1 rounded border border-border bg-surface text-sm text-text
                                     placeholder-text-light/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                        <button
                          onClick={() => handleAddSubtask(task.id)}
                          className="px-2 py-1 bg-primary text-white rounded text-xs cursor-pointer hover:bg-primary-dark"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Прогресс-бар */}
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

      {/* Модалка переноса */}
      <TaskTransferModal
        isOpen={transferTaskId !== null}
        onClose={() => setTransferTaskId(null)}
        taskTitle={transferTaskTitle}
        currentDate={currentDate}
        onConfirm={(data) => {
          if (transferTaskId && onTransferTask) {
            onTransferTask(transferTaskId, data)
          }
          setTransferTaskId(null)
        }}
      />
    </div>
  )
}