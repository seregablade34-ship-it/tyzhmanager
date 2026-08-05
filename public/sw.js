// ===== Service Worker #тыжменеджер =====
const CACHE_VERSION = 'v4'
const CACHE_NAME = 'tyzhmanager-' + CACHE_VERSION

self.addEventListener('install', function(event) {
  console.log('[SW] Установка', CACHE_VERSION)
  self.skipWaiting()
})

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
    })
  )
})

self.addEventListener('fetch', function(event) {
  var url = event.request.url

  // Пропускаем не-GET, расширения, API
  if (event.request.method !== 'GET') return
  if (url.startsWith('chrome-extension')) return
  if (url.includes('api.tyzhmanager.ru')) return
  if (url.includes('/auth/')) return
  if (url.includes('/rest/')) return
  if (url.includes('/storage/')) return

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
          if (cached) return cached
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          })
        })
      })
  )
})