const CACHE_NAME = 'studanti-v1'
const APP_SHELL = ['/', '/manifest.webmanifest', '/studanti.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('studanti-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    )),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedPage = await caches.match('/')
        if (cachedPage) return cachedPage
        return Response.error()
      }),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy))
        }
        return response
      })
    }),
  )
})
