/* global self, Request */

const VERSION = process.env.SW_VERSION
const FILES = ['/'].concat(process.env.ASSET_LIST)

// Respond with cached resources
self.addEventListener('fetch', function (event) {
  const { request } = event

  // DevTools opening will trigger these o-i-c requests, which this SW can't handle.
  // There's probably more going on here, but I'd rather just ignore this problem. :)
  // https://github.com/paulirish/caltrainschedule.io/issues/49
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return
  }

  event.respondWith(async function () {
    // Respond from the cache if we can
    const cachedResponse = await self.caches.match(request)
    if (cachedResponse) return cachedResponse

    // Else, use the preloaded response, if it's there
    const response = await event.preloadResponse
    if (response) return response

    // Else try the network.
    return fetch(request) /* global fetch */
  }())
})

// Register worker
self.addEventListener('install', function (event) {
  const cacheFiles = self.caches.open(VERSION)
    .then(function (cache) {
      return cache.addAll(FILES.map(url => new Request(url, { credentials: 'same-origin' })))
    })

  event.waitUntil(cacheFiles)
})

// Remove outdated resources
self.addEventListener('activate', function (e) {
  const removeKeys = self.caches.keys()
    .then(function (keyList) {
      return Promise.all(keyList.map(function (key, i) {
        if (keyList[i] !== VERSION) return self.caches.delete(keyList[i])
        return false
      }))
    })

  e.waitUntil(removeKeys)
})
