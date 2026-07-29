// ==========================================
// АНОНИМНАЯ ИДЕНТИФИКАЦИЯ ПОЛЬЗОВАТЕЛЯ
// UUID генерируется один раз и хранится в localStorage
// ==========================================

const STORAGE_KEY = 'tyzhmanager_device_id'

// Генерация UUID v4
function generateUUID(): string {
  // Используем crypto.randomUUID() если доступен (современные браузеры)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Фолбэк для старых браузеров
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Получить device_id (создаёт если нет)
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(STORAGE_KEY)

  if (!deviceId) {
    deviceId = generateUUID()
    localStorage.setItem(STORAGE_KEY, deviceId)
    console.log('🆔 Новый device_id создан:', deviceId)
  }

  return deviceId
}

// Проверить есть ли device_id (без создания)
export function hasDeviceId(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

// Сбросить device_id (для отладки)
export function resetDeviceId(): void {
  localStorage.removeItem(STORAGE_KEY)
  console.log('🗑️ device_id сброшен')
}