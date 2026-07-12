// ===== Service Worker #тыжменеджер =====
// ⚠️ МЕНЯЙ ВЕРСИЮ ПРИ КАЖДОМ ОБНОВЛЕНИИ!
const CACHE_VERSION = 'v3'
const CACHE_NAME = 'tyzhmanager-' + CACHE_VERSION

// При установке — сразу активируем новый SW
self.addEventListener('install', function(event) {
  console.log('[SW] Установка', CACHE_VERSION)
  self.skipWaiting()
})

// При активации — удаляем ВСЕ старые кэши + перезагружаем страницы
self.addEventListener('activate', function(event) {
  console.log('[SW] Активация', CACHE_VERSION)
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME })
          .map(function(name) {
            console.log('[SW] Удаляю старый кэш:', name)
            return caches.delete(name)
          })
      )
    }).then(function() {
      return self.clients.claim()
    }).then(function() {
      // Перезагружаем все открытые вкладки
      return self.clients.matchAll({ type: 'window' })
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.navigate(client.url)
      })
    })
  )
})

// Стратегия: СНАЧАЛА СЕТЬ, потом кэш
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return
  if (event.request.url.startsWith('chrome-extension')) return

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        if (response.ok) {
          var clone = response.clone()
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || new Response('Нет подключения к интернету', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          })
        })
      })
  )
})