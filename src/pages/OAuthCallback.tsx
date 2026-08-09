import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const EDGE_URL = 'https://api.tyzhmanager.ru/functions/v1/oauth-exchange'
const REDIRECT_URI = 'https://tyzhmanager.ru/auth/callback'

export default function OAuthCallback() {
  const [status, setStatus] = useState('РђРІС‚РѕСЂРёР·Р°С†РёСЏ...')
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('=== OAuthCallback MOUNTED ===')
    console.log('URL:', window.location.href)
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const device_id = params.get('device_id') || ''
      const provider = params.get('state')

      console.log('[OAuth] provider:', provider, 'code:', code?.substring(0, 10) + '...')
      if (!code || !provider) throw new Error('РћС‚СЃСѓС‚СЃС‚РІСѓРµС‚ РєРѕРґ Р°РІС‚РѕСЂРёР·Р°С†РёРё')

      setStatus('РЎРІСЏР·С‹РІР°РµРјСЃСЏ СЃ ' + (provider === 'yandex' ? 'РЇРЅРґРµРєСЃ' : 'Р’РљРѕРЅС‚Р°РєС‚Рµ') + '...')

      // Р”Р»СЏ Р’Рљ Р±РµСЂС‘Рј code_verifier РёР· localStorage
      const code_verifier = provider === 'vk'
        ? localStorage.getItem('vk_code_verifier') || ''
        : ''

      console.log('[OAuth] Calling Edge Function... code_verifier:', code_verifier ? 'yes' : 'no')

      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, code, redirect_uri: REDIRECT_URI, code_verifier, device_id }),
      })

      console.log('[OAuth] Status:', res.status)
      if (!res.ok) {
        const err = await res.json()
        console.error('[OAuth] Error:', err)
        throw new Error(err.error || 'РћС€РёР±РєР° СЃРµСЂРІРµСЂР°')
      }

      const data = await res.json()
      console.log('[OAuth] Got session for:', data.user?.email)
      setStatus('Р’С…РѕРґРёРј РІ РїСЂРёР»РѕР¶РµРЅРёРµ...')

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
      if (sessionError) throw sessionError

      console.log('[OAuth] Session set OK! Redirecting...')
      localStorage.setItem('tyzhmanager_remember', '1')
      // РћС‡РёС‰Р°РµРј VK verifier
      localStorage.removeItem('vk_code_verifier')
      window.location.href = '/'
    } catch (err: any) {
      console.error('[OAuth] ERROR:', err)
      setError(err.message || 'РќРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР°')
    }
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 40,
          textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>вќЊ</div>
          <h2 style={{ color: '#f43f5e', marginBottom: 8 }}>РћС€РёР±РєР° Р°РІС‚РѕСЂРёР·Р°С†РёРё</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>{error}</p>
          <a href="/" style={{ display: 'inline-block', padding: '12px 32px',
            background: '#2563eb', color: 'white', borderRadius: 8,
            textDecoration: 'none', fontWeight: 600 }}>Р’РµСЂРЅСѓС‚СЊСЃСЏ РєРѕ РІС…РѕРґСѓ</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>вЏі</div>
        <p style={{ color: '#94a3b8', fontSize: 18 }}>{status}</p>
      </div>
    </div>
  )
}
