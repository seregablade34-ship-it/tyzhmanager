import { useState } from 'react'
import { db } from '../db/database'

export default function DailyPage() {
  const [status, setStatus] = useState('⏳ Ожидание проверки...')
  const [tasks, setTasks] = useState<string[]>([])

  // Тест: создаём задачу, читаем, удаляем
  async function testDatabase() {
    try {
      setStatus('🔄 Проверяю базу данных...')

      // 1. Создаём тестовую задачу
      const now = new Date().toISOString()
      const id = await db.tasks.add({
        date: '2026-01-01',
        title: 'Тестовая задача — база работает!',
        isCompleted: false,
        priority: 'high',
        order: 1,
        createdAt: now,
        updatedAt: now,
      })

      // 2. Читаем все задачи из базы
      const allTasks = await db.tasks.toArray()
      setTasks(allTasks.map(t => `#${t.id}: ${t.title}`))

      // 3. Удаляем тестовую задачу
      await db.tasks.delete(id)

      setStatus('✅ База данных работает отлично!')
    } catch (error) {
      setStatus(`❌ Ошибка: ${error}`)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text mb-4">
        📅 Ежедневник
      </h1>

      {/* Блок тестирования базы данных */}
      <div className="bg-surface border border-border rounded-lg p-6 max-w-lg">
        <h2 className="text-lg font-semibold mb-4">
          🧪 Тест базы данных
        </h2>

        <p className="text-text-light mb-4">{status}</p>

        <button
          onClick={testDatabase}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
        >
          Запустить тест
        </button>

        {tasks.length > 0 && (
          <div className="mt-4 p-3 bg-bg rounded-lg">
            <p className="text-sm font-medium mb-2">📋 Найденные задачи:</p>
            {tasks.map((t, i) => (
              <p key={i} className="text-sm text-text-light">{t}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}