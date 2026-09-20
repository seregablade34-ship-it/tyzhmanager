import { useState, useEffect } from 'react'
import { goalsTable, ppSmartsTable } from '../api/helpers'
import type { Goal, PpSmart } from '../types'
import PpSmartForm from '../components/PpSmartForm'

const FIELD_INFO = [
  { key: 'positive', letter: 'P', title: 'Positive — Позитивный', emoji: '✨' },
  { key: 'personal', letter: 'P', title: 'Proactive — Проактивность', emoji: '💪' },
  { key: 'specific', letter: 'S', title: 'Specific — Конкретная', emoji: '🎯' },
  { key: 'measurable', letter: 'M', title: 'Measurable — Измеримая', emoji: '📊' },
  { key: 'achievable', letter: 'A', title: 'Achievable — Достижимая', emoji: '🛠️' },
  { key: 'relevant', letter: 'R', title: 'Relevant — Релевантная', emoji: '🧭' },
  { key: 'timeBound', letter: 'T', title: 'Time-bound — Ограниченная по времени', emoji: '⏰' },
]

function generateFormulation(ppSmart: PpSmart): string {
  const parts: string[] = []
  if (ppSmart.positive.trim()) parts.push(ppSmart.positive.trim())
  if (ppSmart.personal.trim()) parts.push(ppSmart.personal.trim())
  if (ppSmart.specific.trim()) parts.push(`а именно: ${ppSmart.specific.trim()}`)
  if (ppSmart.measurable.trim()) parts.push(`(${ppSmart.measurable.trim()})`)
  if (ppSmart.achievable.trim()) parts.push(`благодаря тому, что ${ppSmart.achievable.trim()}`)
  if (ppSmart.relevant.trim()) parts.push(`для ${ppSmart.relevant.trim()}`)
  if (ppSmart.timeBound.trim()) {
    const time = ppSmart.timeBound.trim()
    parts.push(time.toLowerCase().startsWith('до ') ? time : `до ${time}`)
  }
  return parts.join(', ')
}

export default function PpSmartPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [ppSmarts, setPpSmarts] = useState<PpSmart[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPpSmart, setEditingPpSmart] = useState<PpSmart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState<'linked' | 'free'>('linked')
  const [relinkingId, setRelinkingId] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [goalsData, ppSmartsData] = await Promise.all([
        goalsTable.getAll('order'),
        ppSmartsTable.getAll(),
      ])
      setGoals(goalsData)
      setPpSmarts(ppSmartsData)

      if (!selectedGoalId && mode === 'linked') {
        if (goalsData.length > 0) {
          setSelectedGoalId(goalsData[0].id!)
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function getSelectedTitle(): string {
    if (!selectedGoalId) return ''
    const g = goals.find(g => g.id === selectedGoalId)
    return g?.title || ''
  }

  function getLinkTitle(goalId: number): string {
    if (!goalId || goalId === 0) return ''
    const g = goals.find(g => g.id === goalId)
    return g ? `🎯 Цель: «${g.title}»` : '⚠️ Цель удалена'
  }

  const currentPpSmart = mode === 'linked'
    ? ppSmarts.find(p => p.goalId === selectedGoalId) || null
    : null

  const freePpSmarts = ppSmarts.filter(p => !p.goalId || p.goalId === 0)
  const goalsWithPpSmart = new Set(ppSmarts.map(p => p.goalId))

  async function handleSave(data: {
    positive: string
    personal: string
    specific: string
    measurable: string
    achievable: string
    relevant: string
    timeBound: string
  }) {
    try {
      const now = new Date().toISOString()

      if (editingPpSmart) {
        await ppSmartsTable.update(editingPpSmart.id!, {
          ...data,
          updatedAt: now,
        })
      } else {
        const goalId = mode === 'free' ? 0 : (selectedGoalId || 0)
        await ppSmartsTable.create({
          goalId,
          ...data,
          createdAt: now,
          updatedAt: now,
        })
      }

      await loadData()
      setShowForm(false)
      setEditingPpSmart(null)
    } catch (error) {
      console.error('Ошибка сохранения PP SMART:', error)
    }
  }

  async function handleLink(ppSmartId: number, newGoalId: number) {
    try {
      await ppSmartsTable.update(ppSmartId, {
        goalId: newGoalId,
        updatedAt: new Date().toISOString(),
      })
      await loadData()
      setRelinkingId(null)
      setMode('linked')
      setSelectedGoalId(newGoalId)
    } catch (error) {
      console.error('Ошибка привязки:', error)
    }
  }

  async function handleUnlink(ppSmartId: number) {
    try {
      await ppSmartsTable.update(ppSmartId, {
        goalId: 0,
        updatedAt: new Date().toISOString(),
      })
      await loadData()
      setRelinkingId(null)
      setMode('free')
    } catch (error) {
      console.error('Ошибка отвязки:', error)
    }
  }

  function handleEdit(ppSmart?: PpSmart) {
    const target = ppSmart || currentPpSmart
    if (target) {
      setEditingPpSmart(target)
      setShowForm(true)
    }
  }

  async function handleDelete(ppSmart?: PpSmart) {
    const target = ppSmart || currentPpSmart
    if (!target) return
    const confirmed = window.confirm('Удалить этот PP SMART?')
    if (!confirmed) return

    try {
      await ppSmartsTable.remove(target.id!)
      await loadData()
    } catch (error) {
      console.error('Ошибка удаления PP SMART:', error)
    }
  }

  function handleCancel() {
    setShowForm(false)
    setEditingPpSmart(null)
  }

  // ═══ Создать ЦЕЛЬ из PP SMART ═══
  async function handleAddToGoals(ppSmart: PpSmart) {
    try {
      const formulation = generateFormulation(ppSmart)
      const title = ppSmart.positive.trim() || 'Цель из PP SMART'
      const now = new Date().toISOString()

      const created = await goalsTable.create({
        title,
        description: formulation,
        sphere: 'Развитие',
        deadline: `${new Date().getFullYear()}-12-31`,
        status: 'active',
        progress: 0,
        priority: 'medium',
        order: goals.length,
        createdAt: now,
        updatedAt: now,
      })

      const goalId = created.id as number
      await ppSmartsTable.update(ppSmart.id!, {
        goalId,
        updatedAt: now,
      })

      await loadData()
      setMode('linked')
      setSelectedGoalId(goalId)
    } catch (error) {
      console.error('Ошибка создания цели:', error)
    }
  }

  const selectedTitle = getSelectedTitle()

  // ═══ СПИСОК ЦЕЛЕЙ ДЛЯ ПРИВЯЗКИ ═══
  function renderLinkList(ppSmart: PpSmart) {
    if (goals.length === 0) return null

    return (
      <div className="mt-4 bg-warning/5 border border-warning/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-text-light">🔗 Привязать к цели:</p>
          {relinkingId === ppSmart.id && (
            <button
              onClick={() => setRelinkingId(null)}
              className="text-xs text-text-light hover:text-text cursor-pointer"
            >
              ✕ Закрыть
            </button>
          )}
        </div>
        <div className="grid gap-1 max-h-40 overflow-y-auto">
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => handleLink(ppSmart.id!, g.id!)}
              className={`text-left text-xs px-3 py-1.5 rounded-lg
                         transition-colors cursor-pointer flex items-center gap-2
                         ${ppSmart.goalId === g.id
                           ? 'bg-primary/10 text-primary font-medium'
                           : 'bg-bg hover:bg-primary/10 hover:text-primary'
                         }`}
            >
              <span>🎯 {g.title}</span>
              <span className="text-text-light">{g.sphere}</span>
              {ppSmart.goalId === g.id && <span className="ml-auto">✔</span>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  function renderPpSmartCard(ppSmart: PpSmart, linkedTitle?: string) {
    const formulation = generateFormulation(ppSmart)
    const isFree = !ppSmart.goalId || ppSmart.goalId === 0
    const isRelinking = relinkingId === ppSmart.id

    const linkTitle = isFree ? '' : getLinkTitle(ppSmart.goalId)
    const isOrphan = !isFree && linkTitle.startsWith('⚠️')

    return (
      <div key={ppSmart.id} className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-text text-lg">PP SMART</h2>
            {linkedTitle && !isOrphan && (
              <p className="text-xs text-text-light mt-0.5">{linkedTitle}</p>
            )}
            {isOrphan && (
              <p className="text-xs text-red-500 mt-0.5">{linkTitle}</p>
            )}
          </div>
          <div className="flex gap-1">
            {!isFree && (
              <button
                onClick={() => setRelinkingId(isRelinking ? null : ppSmart.id!)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg
                           transition-colors cursor-pointer text-sm
                           ${isRelinking
                             ? 'text-primary bg-primary/10'
                             : 'text-text-light hover:text-primary hover:bg-primary/10'
                           }`}
                title="Сменить привязку"
              >
                🔄
              </button>
            )}
            <button
              onClick={() => handleEdit(ppSmart)}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         text-text-light hover:text-primary hover:bg-primary/10
                         transition-colors cursor-pointer text-sm"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDelete(ppSmart)}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         text-text-light hover:text-danger hover:bg-danger/10
                         transition-colors cursor-pointer text-sm"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {FIELD_INFO.map(field => {
            const value = ppSmart[field.key as keyof PpSmart] as string
            if (!value) return null
            return (
              <div key={field.key} className="bg-bg rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{field.emoji}</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {field.letter}
                  </span>
                  <span className="text-sm font-semibold text-text">{field.title}</span>
                </div>
                <p className="text-sm text-text ml-8 leading-relaxed">{value}</p>
              </div>
            )
          })}
        </div>

        {formulation && (
          <div className="mt-4 bg-gradient-to-r from-primary/5 to-success/5 border-2 border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📝</span>
              <h4 className="text-sm font-bold text-text">Итоговая формулировка цели</h4>
            </div>
            <p className="text-sm text-text leading-relaxed italic">«{formulation}»</p>
          </div>
        )}

        {/* Кнопка создать цель (для свободных) */}
        {isFree && formulation && (
          <div className="mt-4 bg-success/5 border-2 border-success/20 rounded-xl p-4">
            <p className="text-sm font-bold text-text mb-3">
              🚀 Создать цель из этого PP SMART:
            </p>
            <button
              onClick={() => handleAddToGoals(ppSmart)}
              className="w-full px-4 py-2.5 bg-primary text-white rounded-lg
                         hover:bg-primary-dark transition-colors cursor-pointer
                         font-medium text-sm flex items-center justify-center gap-2"
            >
              🎯 В Мои цели
            </button>
          </div>
        )}

        {/* Привязка для свободных */}
        {isFree && renderLinkList(ppSmart)}

        {/* Смена привязки для привязанных */}
        {!isFree && isRelinking && (
          <div className="mt-4">
            <button
              onClick={() => handleUnlink(ppSmart.id!)}
              className="w-full mb-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg
                         hover:bg-red-100 transition-colors cursor-pointer
                         font-medium text-sm flex items-center justify-center gap-2"
            >
              🔓 Отвязать (сделать свободным)
            </button>
            {renderLinkList(ppSmart)}
          </div>
        )}

        {/* Предупреждение: привязка удалена */}
        {isOrphan && !isRelinking && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600 font-medium mb-2">
              ⚠️ Цель была удалена. Перепривяжите PP SMART:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRelinkingId(ppSmart.id!)}
                className="flex-1 px-3 py-2 bg-primary text-white rounded-lg
                           hover:bg-primary-dark transition-colors cursor-pointer
                           font-medium text-sm"
              >
                🔄 Привязать заново
              </button>
              <button
                onClick={() => handleUnlink(ppSmart.id!)}
                className="flex-1 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg
                           hover:bg-red-100 transition-colors cursor-pointer
                           font-medium text-sm"
              >
                🔓 Сделать свободным
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-text-light">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">🧩 PP SMART</h1>
          <p className="text-sm text-text-light mt-1">
            Детализация целей по авторской методологии
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setMode('free')
              setEditingPpSmart(null)
              setShowForm(true)
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg
                       hover:bg-primary-dark transition-colors cursor-pointer
                       font-medium flex items-center gap-2 text-sm"
          >
            <span>+</span>
            <span>Свободный PP SMART</span>
          </button>
        )}
      </div>

      {!showForm && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('linked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                       ${mode === 'linked'
                         ? 'bg-primary text-white'
                         : 'bg-bg text-text-light hover:bg-border border border-border'
                       }`}
          >
            🔗 К целям
          </button>
          <button
            onClick={() => setMode('free')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                       ${mode === 'free'
                         ? 'bg-primary text-white'
                         : 'bg-bg text-text-light hover:bg-border border border-border'
                       }`}
          >
            🆓 Свободные ({freePpSmarts.length})
          </button>
        </div>
      )}

      {mode === 'linked' && !showForm && (
        <>
          {goals.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-4 mb-6">
              <label className="block text-sm font-medium text-text-light mb-2">
                Выберите цель для PP SMART:
              </label>
              <div className="grid gap-1.5">
                {goals.map(goal => {
                  const hasPpSmart = goalsWithPpSmart.has(goal.id!)
                  const isSelected = selectedGoalId === goal.id
                  return (
                    <button
                      key={goal.id}
                      onClick={() => {
                        setSelectedGoalId(goal.id!)
                        setShowForm(false)
                        setEditingPpSmart(null)
                        setRelinkingId(null)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer
                        flex items-center justify-between
                        ${isSelected
                          ? 'bg-primary/10 border-2 border-primary text-text'
                          : 'bg-bg border-2 border-transparent text-text-light hover:bg-border'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{goal.title}</span>
                        <span className="text-xs text-text-light bg-surface px-2 py-0.5 rounded-full">
                          {goal.sphere}
                        </span>
                      </div>
                      {hasPpSmart ? (
                        <span className="text-xs text-success font-medium">✅ Есть</span>
                      ) : (
                        <span className="text-xs text-text-light">—</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedGoalId && (
            <>
              {currentPpSmart && renderPpSmartCard(currentPpSmart, `Цель: «${selectedTitle}»`)}

              {!currentPpSmart && (
                <div className="text-center py-8">
                  <p className="text-4xl mb-4">🧩</p>
                  <h3 className="text-lg font-semibold text-text mb-2">PP SMART не создан</h3>
                  <p className="text-text-light mb-6">
                    Детализируйте цель «{selectedTitle}» по 7 критериям
                  </p>
                  <button
                    onClick={() => {
                      setMode('linked')
                      setEditingPpSmart(null)
                      setShowForm(true)
                    }}
                    className="px-6 py-3 bg-primary text-white rounded-lg
                               hover:bg-primary-dark transition-colors cursor-pointer font-medium"
                  >
                    ➕ Создать PP SMART
                  </button>
                </div>
              )}
            </>
          )}

          {goals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-4xl mb-4">🎯</p>
              <h3 className="text-lg font-semibold text-text mb-2">Нет целей для привязки</h3>
              <p className="text-text-light mb-4">
                Создайте цель в «Мои цели»,
                или используйте свободный PP SMART.
              </p>
              <button
                onClick={() => {
                  setMode('free')
                  setEditingPpSmart(null)
                  setShowForm(true)
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg
                           hover:bg-primary-dark transition-colors cursor-pointer font-medium"
              >
                ➕ Создать свободный PP SMART
              </button>
            </div>
          )}
        </>
      )}

      {mode === 'free' && !showForm && (
        <>
          {freePpSmarts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-4">🆓</p>
              <h3 className="text-lg font-semibold text-text mb-2">Нет свободных PP SMART</h3>
              <p className="text-text-light mb-6">
                Создайте PP SMART без привязки к цели — привяжете потом
              </p>
              <button
                onClick={() => {
                  setEditingPpSmart(null)
                  setShowForm(true)
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg
                           hover:bg-primary-dark transition-colors cursor-pointer font-medium"
              >
                ➕ Создать свободный PP SMART
              </button>
            </div>
          ) : (
            <div>
              {freePpSmarts.map(ppSmart => renderPpSmartCard(ppSmart, '🆓 Свободная цель'))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <PpSmartForm
          editingPpSmart={editingPpSmart}
          goalTitle={mode === 'linked' ? selectedTitle : ''}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}