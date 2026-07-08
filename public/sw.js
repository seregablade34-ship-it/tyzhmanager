const CACHE_NAME = 'tyzhmanager-v1'

// Файлы для кэширования при установке
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon-192.svg',
  '/manifest.json',
]

// ═══ УСТАНОВКА — кэшируем основные файлы ═══
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ═══ АКТИВАЦИЯ — удаляем старые кэши ═══
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// ═══ FETCH — стратегия Network First, затем Cache ═══
self.addEventListener('fetch', (event) => {
  // Пропускаем запросы не GET
  if (event.request.method !== 'GET') return

  // Пропускаем chrome-extension и другие схемы
  if (!event.request.url.startsWith('http')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Клонируем ответ и сохраняем в кэш
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Офлайн — берём из кэша
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Если запрос навигации — отдаём index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})