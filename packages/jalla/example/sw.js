/* eslint-env serviceworker */

var CACHE_KEY = process.env.npm_package_version
var FILES = ['/'].concat(process.env.ASSET_LIST)

self.addEventListener('install', function oninstall (event) {
  event.waitUntil(
    caches
      .open(CACHE_KEY)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', function onactivate (event) {
  event.waitUntil(clear().then(() => self.clients.claim()))
})

self.addEventListener('fetch', function onfetch (event) {
  event.respondWith(
    caches.open(CACHE_KEY).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        return update(event.request, cached)
      })

      // fetch request and update cache
      // (Cache, Request, Response?) -> Response|Promise
      function update (req, fallback) {
        if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') {
          return fallback
        }

        return self.fetch(req).then(function (response) {
          if (!response.ok) {
            if (fallback) return fallback
            else return response
          }
          cache.put(req, response.clone())
          return response
        }, function (err) {
          if (fallback) return fallback
          throw err
        })
      }
    })
  )
})

// clear application cache
// () -> Promise
function clear () {
  return caches.keys().then(function (keys) {
    keys = keys.filter((key) => key !== CACHE_KEY)
    return Promise.all(keys.map((key) => caches.delete(key)))
  })
}
