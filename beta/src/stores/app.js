/* global localStorage */

require('browser-cookies')

const setTitle = require('../lib/title')
const isUrl = require('validator/lib/isURL')
const generateApi = require('../lib/api')
const resolvePlaysAndFavorites = require('../lib/resolve-plays-favorites')
const LoaderTimeout = require('../lib/loader-timeout')

const { getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST
})

/**
 * Logging
 */

const logger = require('nanologger')
const log = logger('stream2own')

const Playlist = require('@resonate/playlist-component')

function app () {
  return (state, emitter) => {
    Object.assign(state, {
      title: 'Resonate',
      credits: 0,
      resolved: false,
      api: generateApi(), // api v1, will be removed
      library: {
        items: []
      },
      user: {
        uid: 0,
        ownedGroups: []
      },
      tracks: [],
      albums: [],
      notification: {
        permission: false
      },
      messages: []
    }) // initialize state

    function setMeta () {
      const title = {
        '/': 'Resonate',
        discover: 'Discover',
        faq: 'FAQ',
        login: 'Login',
        search: state.query.q ? state.query.q + ' • ' + 'Search' : 'Search',
        settings: 'Settings',
        'u/:id': 'Profile',
        'u/:id/library/:type': {
          favorites: 'Favorites',
          collection: 'Collection',
          history: 'History'
        }[state.params.type]
      }[state.route]

      if (!title) return

      state.shortTitle = title

      emitter.emit('meta', {
        title: setTitle(title),
        'twitter:card': 'summary_large_image',
        'twitter:title': setTitle(title),
        'twitter:site': '@resonatecoop'
      })
    }

    emitter.on('navigate:back', () => {
      return window.history.back()
    })

    emitter.on('error', (err) => {
      log.error(err)
    })

    emitter.on('tracks:clear', () => {
      state.tracks = []
      emitter.emit(state.events.RENDER)
    })

    emitter.on('route:/', () => {
      emitter.emit(state.events.REPLACESTATE, '/discover')
    })

    emitter.on('route:discovery', () => {
      emitter.emit(state.events.REPLACESTATE, '/discover')
    })

    emitter.on('route:u/:id/library/history', library)
    emitter.on('route:u/:id/library/:type', library)

    async function library () {
      if (!state.user.uid) {
        state.redirect = state.href
        return emitter.emit('redirect', { dest: '/login', message: 'You are not logged in…' })
      }

      const type = state.params.type || 'history'

      // api service
      const service = {
        history: 'plays',
        collection: 'collection',
        favorites: 'favorites'
      }[type]

      if (!service) {
        return emitter.emit(state.events.PUSHSTATE, '/')
      }

      // api operation id
      const operationID = {
        history: 'getPlayHistory',
        collection: 'getCollection',
        favorites: 'getFavorites'
      }[type]

      state.cache(Playlist, `playlist-${type}`)

      const { machine, events } = state.components[`playlist-${type}`]

      if (machine.state.request === 'loading') {
        return
      }

      state.library.items = []
      state.library.numberOfPages = 0

      emitter.emit(state.events.RENDER)

      const loaderTimeout = LoaderTimeout(events)
      machine.emit('start')

      try {
        const getClient = getAPIServiceClientWithAuth(state.user.token)
        const client = await getClient(service)
        const request = client[operationID]

        const result = await request(Object.assign({ limit: 50 }, state.query))
        const { body: response } = result

        if (response.data) {
          state.library.items = response.data.map((item) => {
            return {
              count: 0,
              favorite: false,
              track_group: [
                item
              ],
              track: item,
              url: item.url || `https://api.resonate.is/v1/stream/${item.id}`
            }
          })
          state.library.numberOfPages = response.numberOfPages || response.pages

          if (state.user.uid) {
            const ids = response.data.map(item => item.id)
            const [counts, favorites] = await resolvePlaysAndFavorites(ids)(state)

            state.library.items = state.library.items.map((item) => {
              return Object.assign({}, item, {
                count: counts[item.track.id] || 0,
                favorite: !!favorites[item.track.id]
              })
            })
          }

          machine.emit('resolve')

          if (!state.tracks.length) {
            state.tracks = state.library.items
          }
        } else {
          machine.emit('404')
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        machine.emit('reject')
        emitter.emit('error', err)
      } finally {
        events.state.loader === 'on' && events.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
      }
    }

    emitter.on('refresh', () => {
      emitter.emit(`route:${state.route}`, false)
    })

    emitter.on('route:login', async () => {
      if (state.api.token || state.user.uid) {
        emitter.emit('redirect', { dest: '/', message: 'You are already logged in' })
      }
    })

    emitter.on('VISIBILITYCHANGE', (vis) => {
      if (vis === 'VISIBLE') {
        emitter.emit('auth', { reload: false })
        emitter.emit('update')
      }
    })

    emitter.on('auth', async (props = {}) => {
      const { reload = true } = props

      if (state.cookieConsentStatus === 'deny') {
        return emitter.emit('api:ok')
      }

      try {
        const getClient = getAPIServiceClientWithAuth(state.user.token || props.token)
        const client = await getClient('profile')
        const result = await client.getUserProfile()
        const { body: response } = result
        const { data: userData } = response

        if (userData) {
          // ok
          state.user = userData
          state.clientId = userData.clientId
          state.credits = userData.credits
          state.token = userData.token

          // v1 api (will be removed)
          state.api = generateApi({ token: state.token, clientId: state.clientId })
        } else if (response.status === 401) {
          // 401 unauthorized access
          emitter.emit('logout')
        } else if (response.status) {
          // Unhandled
          log.error('Unhandled response status')
        }
      } catch (err) {
        log.error(err)
      } finally {
        if (reload) emitter.emit('api:ok')
        emitter.emit(state.events.RENDER)
      }
    })

    emitter.on('logout', async (redirect = false) => {
      state.user = {
        ownedGroups: []
      }
      state.credits = 0
      delete state.clientId

      if (process.env.AUTH_API === 'v2') {
        window.location = '/api/v2/user/logout'
      } else {
        // handle v1 logout
        await state.api.auth.logout()
      }

      state.api = generateApi()

      emitter.emit(state.events.RENDER)

      if (redirect) {
        emitter.emit('redirect', {
          dest: '/login',
          message: 'You are now logged out…'
        })
      }
    })

    emitter.on(state.events.DOMCONTENTLOADED, () => {
      localStorage !== null && localStorage.removeItem('credits')

      emitter.emit('auth')

      if (!navigator.onLine) {
        emitter.emit('notify', { message: 'Your browser is offline' })
      }

      setMeta()

      emitter.emit('update')

      emitter.on('OFFLINE', () => {
        emitter.emit('notify', { message: 'Your browser is offline' })
      })

      emitter.on('api:ok', () => {
        state.resolved = true
        emitter.emit(state.events.RENDER)
        log.info('api ok')
        emitter.emit(`route:${state.route}`)
      })
    })

    emitter.on(state.events.NAVIGATE, () => {
      setTimeout(() => window.scrollTo(0, 0), 0)
      setMeta()
      emitter.emit(`route:${state.route}`)

      const { machine } = state.components['player-footer']

      if (machine.state.fullscreen === 'on') {
        machine.emit('fullscreen:toggle')
      }
    })

    emitter.on('credits:set', (credits) => {
      state.credits = credits

      emitter.emit('notify', {
        timeout: 3000,
        message: 'You credits have been topped up'
      })

      emitter.emit(state.events.RENDER)
    })

    emitter.on('redirect', (props = {}) => {
      const {
        dest = '/',
        timeout = 3000,
        update = false,
        message = 'Redirecting...',
        silent = false
      } = props

      if (message && !silent) {
        emitter.emit('notify', { timeout, message })
      }

      if (isUrl(dest)) {
        return setTimeout(() => {
          window.location = dest
        }, timeout)
      }

      emitter.emit(state.events.REPLACESTATE, dest)

      if (update) {
        emitter.emit('update')
      }
    })
  }
}

module.exports = app
