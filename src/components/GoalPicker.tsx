import { useState, useEffect } from 'react'
import { goalsTable } from '../api/helpers'
import type { Goal } from '../types'

interface GoalPickerProps {
  onSelect: (item: { title: string; description?: string; source: string }) => void
  onClose: () => void
}

export default function GoalPicker({
  onSelect,
  onClose,
}: GoalPickerProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const g = await goalsTable.getAll()
    setGoals(g.filter(g => (g.status || 'active') === 'active'))
  }

  const filteredGoals = goals.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">

        {/* Заголовок */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              📥 Импорт цели
            </h2>
            <p className="text-xs text-text-light mt-0.5">
              Выберите цель для импорта
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-bg transition-colors cursor-pointer text-text-light"
          >
            ✕
          </button>
        </div>

        {/* Поиск */}
        <div className="p-3 border-b border-border">
          <input
            type="text"
            placeholder="🔍 Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Список */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-8 text-text-light text-sm">
              {search ? 'Ничего не найдено' : 'Нет активных целей'}
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredGoals.map(item => (
                <button
                  key={item.id}
                  onClick={() =>
                    onSelect({
                      title: item.title,
                      description: item.description || '',
                      source: 'Мои цели',
                    })
                  }
                  className="w-full text-left p-3 border border-border rounded-lg
                             hover:border-primary hover:bg-primary/5 transition-colors
                             cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text text-sm truncate">
                        {item.title}
                      </p>
                      <span className="text-xs text-text-light">
                        {item.sphere}
                        {item.deadline && ` · до ${new Date(item.deadline).getFullYear()}`}
                      </span>
                    </div>
                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      ➕
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка закрыть */}
        <div className="p-3 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-text-light hover:text-text
                       transition-colors cursor-pointer"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}