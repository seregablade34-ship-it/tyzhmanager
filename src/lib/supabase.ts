// ==========================================
// КЛИЕНТ SUPABASE
// Подключение фронтенда к серверу
// ==========================================

import { createClient } from '@supabase/supabase-js'
import { getDeviceId } from '../utils/deviceId'

// Адрес API Supabase (через Kong на порту 8000)
const SUPABASE_URL = 'https://api.tyzhmanager.ru'

// Анонимный ключ (безопасно хранить на фронтенде)
const SUPABASE_ANON_KEY = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3ODQ3OTM2MDAsICJleHAiOiAyMTAwMzU1MjAwfQ.qBR60x1x_UPO8lSkydNTqgNWJ22lR_dzc4Dk569hFKw'

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