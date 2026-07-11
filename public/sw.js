// ===== Service Worker #тыжменеджер =====
// Версию нужно менять при каждом обновлении!
const CACHE_VERSION = 'v2'
const CACHE_NAME = 'tyzhmanager-' + CACHE_VERSION

// При установке — сразу активируем новый SW
self.addEventListener('install', function(event) {
  self.skipWaiting()
})

// При активации — удаляем старые кэши
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME })
          .map(function(name) { return caches.delete(name) })
      )
    }).then(function() {
      return self.clients.claim()
    })
  )
})

// Стратегия: СНАЧАЛА СЕТЬ, потом кэш
// Это гарантирует актуальный контент
self.addEventListener('fetch', function(event) {
  // Пропускаем не-GET запросы и chrome-extension
  if (event.request.method !== 'GET') return
  if (event.request.url.startsWith('chrome-extension')) return

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Если сеть работает — кэшируем копию
        if (response.ok) {
          var clone = response.clone()
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(function() {
        // Если сети нет — отдаём из кэша
        return caches.match(event.request).then(function(cached) {
          return cached || new Response('Нет подключения к интернету', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          })
        })
      })
  )
})