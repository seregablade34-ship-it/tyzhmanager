// ==========================================
// КЛИЕНТ SUPABASE
// Подключение фронтенда к Supabase Cloud
// ==========================================

import { createClient } from '@supabase/supabase-js'
import { getDeviceId } from '../utils/deviceId'

// Supabase Cloud
const SUPABASE_URL = 'https://hybfjglplvdcoydyjoxj.supabase.co'

// Анонимный ключ Supabase Cloud
const SUPABASE_ANON_KEY = 'sb_publishable_5Ix6qjdmiH6riUPN33gtjg_SYAgHamY'

// Создаём клиент
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    headers: {
      'x-device-id': getDeviceId(),
    },
  },
})

// Экспортируем device_id для удобства
export const deviceId = getDeviceId()