// ==========================================
// ПОМОЩНИК ДЛЯ РАБОТЫ С ДАТАМИ
// ==========================================

// Получить сегодняшнюю дату в формате "2026-01-15"
export function getToday(): string {
  return formatDate(new Date())
}

// Преобразовать дату в строку "2026-01-15"
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Получить предыдущий день
export function getPrevDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() - 1)
  return formatDate(date)
}

// Получить следующий день
export function getNextDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + 1)
  return formatDate(date)
}

// Проверить: это сегодня?
export function isToday(dateStr: string): boolean {
  return dateStr === getToday()
}

// Проверить: это будущий день?
export function isFuture(dateStr: string): boolean {
  return dateStr > getToday()
}

// Красивый формат даты: "15 января 2026, четверг"
export function formatDateHuman(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  
  const weekdays = [
    'воскресенье', 'понедельник', 'вторник', 'среда',
    'четверг', 'пятница', 'суббота'
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const weekday = weekdays[date.getDay()]

  return `${day} ${month} ${year}, ${weekday}`
}

// Короткий формат: "15 янв"
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  
  const months = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ]

  return `${date.getDate()} ${months[date.getMonth()]}`
}