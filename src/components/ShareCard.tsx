import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

interface ShareCardProps {
  isOpen: boolean
  onClose: () => void
  goal: {
    title: string
    sphere: string
    progress: number
    status: 'active' | 'completed' | 'cancelled'
    year: number
  }
  combo?: number
}

const SPHERE_COLORS: Record<string, string> = {
  'Здоровье': '#22c55e',
  'Карьера': '#3b82f6',
  'Финансы': '#f59e0b',
  'Отношения': '#ec4899',
  'Семья': '#8b5cf6',
  'Развитие': '#06b6d4',
  'Хобби': '#f97316',
  'Духовность': '#a855f7',
}

export default function ShareCard({ isOpen, onClose, goal }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const sphereColor = SPHERE_COLORS[goal.sphere] || '#3b82f6'
  const isCompleted = goal.status === 'completed'

  const handleDownload = async () => {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `goal-${goal.title.slice(0, 20)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Error creating image:', e)
    }
    setSaving(false)
  }

  const handleShare = async () => {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      canvas.toBlob(async (blob) => {
        if (!blob) { setSaving(false); return }
        const file = new File([blob], 'goal.png', { type: 'image/png' })
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: '#tyzhmanager', text: goal.title, files: [file] })
        } else {
          handleDownload()
        }
        setSaving(false)
      })
    } catch (e) {
      console.error('Share error:', e)
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: '16px' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '24px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', border: 'none', background: '#f3f4f6', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>X</button>
        <h3 style={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', marginBottom: '16px', color: '#1f2937' }}>Поделиться целью</h3>
        <div ref={cardRef} style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0f5ff', border: '2px solid #dbeafe', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', color: '#ffffff', backgroundColor: sphereColor }}>{goal.sphere}</span>
            {isCompleted && (<span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', color: '#ffffff', backgroundColor: '#22c55e' }}>Достигнута!</span>)}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>{goal.title}</h2>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
              <span style={{ color: '#4b5563', fontWeight: 500 }}>Прогресс</span>
              <span style={{ fontWeight: 700, color: sphereColor }}>{goal.progress}%</span>
            </div>
            <div style={{ height: '12px', backgroundColor: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', width: `${goal.progress}%`, backgroundColor: sphereColor }} />
            </div>
          </div>
          <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>{goal.year}</div>
          <div style={{ paddingTop: '12px', borderTop: '1px solid #d1d5db', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><p style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', margin: 0 }}>#тыжменеджер</p><p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>дневник целей</p></div>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>t.me/degtayrevtrener</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button onClick={handleDownload} disabled={saving} style={{ flex: 1, backgroundColor: '#2563eb', color: '#ffffff', padding: '12px', borderRadius: '12px', fontWeight: 500, fontSize: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>{saving ? 'Сохраняю...' : 'Скачать PNG'}</button>
          <button onClick={handleShare} disabled={saving} style={{ flex: 1, backgroundColor: '#16a34a', color: '#ffffff', padding: '12px', borderRadius: '12px', fontWeight: 500, fontSize: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>Поделиться</button>
        </div>
      </div>
    </div>
  )
}