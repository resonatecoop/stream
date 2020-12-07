const setTitle = require('../lib/title')
const isUrl = require('validator/lib/isURL')
const generateApi = require('../lib/api')
const adapter = require('@resonate/schemas/adapters/v1/track')

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
      resolved: false,
      api: generateApi(),
      apiv2: generateApi({
        version: 2
      }),
      library: {
        items: []
      },
      user: {},
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
        login: 'Login',
        'search/:q': state.params.q ? state.params.q + ' • ' + 'Search' : 'Search',
        artists: 'Artists',
        discovery: 'Discovery',
        labels: 'Labels',
        'u/:id/library/:type': {
          picks: 'Picks',
          collection: 'Collection',
          history: 'History'
        }[state.params.type],
        'playlist/:type': {
          'top-fav': 'Top favorites',
          latest: 'New',
          random: 'Random',
          top: 'Top 50',
          'staff-picks': 'Staff Picks'
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

    emitter.on('error', (err) => {
      log.error(err)
    })

    emitter.on('tracks:clear', () => {
      state.tracks = []
      emitter.emit(state.events.RENDER)
    })

    emitter.on('route:/', () => {
      /*
      if (state.user.uid) {
        return emitter.emit('redirect', { dest: '/discovery', silent: true })
      }
      */
    })

    emitter.on('route:browse', () => {
      return emitter.emit('redirect', { dest: '/artists' })
    })

    emitter.on('route:u/:id/library', () => {
      return emitter.emit('redirect', { dest: '/library/picks' })
    })

    emitter.on('route:u/:id/library/history', library)
    emitter.on('route:u/:id/library/:type', library)

    async function library () {
      if (!state.user.uid) {
        state.redirect = state.href
        return emitter.emit('redirect', { dest: '/login', message: 'You are not logged in…' })
      }

      const type = state.params.type || 'history'

      state.cache(Playlist, `playlist-${type}`)

      state.library.items = []
      state.library.numberOfPages = 0

      emitter.emit(state.events.RENDER)

      const { machine, events } = state.components[`playlist-${type}`]
      const loaderTimeout = setTimeout(() => {
        events.emit('loader:on')
      }, 300)

      machine.emit('start')

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1
        const request = state.api.users.tracks[type]

        if (typeof request !== 'function') {
          return emitter.emit(state.events.PUSHSTATE, '/')
        }

        const response = await request({
          uid: state.user.uid,
          limit: 50,
          page: pageNumber - 1
        })

        if (events.state.loader === 'on') {
          events.emit('loader:off')
        }

        if (response.data) {
          state.library.items = response.data.map(adapter)
          state.library.numberOfPages = response.numberOfPages

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
        log.error(err)
      } finally {
        clearTimeout(loaderTimeout)
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
        emitter.emit('users:auth', false)
        emitter.emit('update')
      }
    })

    emitter.on('users:auth', async (reload = true) => {
      try {
        const response = await state.api.auth.tokens()

        if (response.status !== 401) {
          const { accessToken: token, clientId, user } = response
          state.user = user
          state.clientId = clientId
          state.api = generateApi({ token, clientId })
          state.apiv2 = generateApi({ token, clientId, version: 2 })
        } else {
          emitter.emit('logout')
        }
      } catch (err) {
        emitter.emit('logout')
        log.error(err)
      } finally {
        if (reload) emitter.emit('api:ok')
        emitter.emit(state.events.RENDER)
      }
    })

    emitter.on('logout', async (redirect = false) => {
      state.user = {}
      state.api = generateApi()
      state.apiv2 = generateApi({ version: 2 })

      try {
        await state.api.auth.logout()

        if (redirect) {
          emitter.emit('redirect', {
            dest: '/login',
            message: 'You are now logged out…'
          })
        }
      } catch (err) {
        emitter.emit('error', err)
      }
    })

    emitter.on(state.events.DOMCONTENTLOADED, () => {
      emitter.emit('users:auth')

      document.body.removeAttribute('unresolved') // this attribute was set to prevent fouc on chrome

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
      setMeta()
      emitter.emit(`route:${state.route}`)

      const { machine } = state.components['player-footer']

      if (machine.state.fullscreen === 'on') {
        machine.emit('fullscreen:toggle')
      }

      window.scrollTo(0, 0)
    })

    emitter.on('credits:set', async (credits) => {
      state.credits = credits
      window.localStorage.setItem('credits', credits)

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
