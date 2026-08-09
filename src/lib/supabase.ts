// ==========================================
// КЛИЕНТ SUPABASE
// Подключение фронтенда к серверу
// ==========================================

import { createClient } from '@supabase/supabase-js'
import { getDeviceId } from '../utils/deviceId'

// Адрес API Supabase (через Kong на порту 8000)
const SUPABASE_URL = 'https://api.tyzhmanager.ru'

// Анонимный ключ (обновлён 07.08.2026 — без пробелов в JSON)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg0NzkzNjAwLCJleHAiOjIxMDAzNTUyMDB9.YN12BmGtEz18Whpwl3HaxrJhLJ1Z8sXMAEkXC-6wb-M'

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