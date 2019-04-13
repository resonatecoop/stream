/**
 * Utils
 */
const promiseHash = require('promise-hash/lib/promise-hash')
const setTitle = require('../lib/title')

const storage = require('localforage')
storage.config({
  name: 'resonate',
  version: 1.0,
  size: 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName: 'app', // Should be alphanumeric, with underscores.
  description: 'Resonate storage'
})
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
      resolved: false,
      app: {
        onlineStatus: 'ONLINE'
      },
      api: generateApi(),
      artists: [],
      artist: {
        data: {},
        tracks: []
      },
      label: {
        data: {},
        tracks: []
      },
      labels: [],
      user: {
        resolved: false
      },
      tracks: [],
      albums: [],
      notification: {
        permission: false
      },
      messages: []
    }) // initialize state

    emitter.on('route:labels', async () => {
      if (state.labels.length) return
      try {
        const response = await state.api.labels.find({ limit: 300 })
        if (response.data) {
          state.labels = response.data
          emitter.emit(state.events.RENDER)
        }
      } catch (err) {
        log.error(err)
      }
    })

    emitter.on('route:labels/:uid', getLabel)

    async function getLabel () {
      try {
        const uid = parseInt(state.params.uid, 10)
        const isNew = state.label.data.id !== uid

        if (!isNew) {
          return emitter.emit(state.events.DOMTITLECHANGE, setTitle(state.label.data.name))
        }

        state.label = {
          data: {},
          tracks: []
        }

        emitter.emit(state.events.RENDER)

        const { albums, artists, label } = await promiseHash({
          albums: state.api.labels.getAlbums({ uid }),
          artists: state.api.labels.getArtists({ uid }),
          label: state.api.labels.findOne({ uid })
        })

        if (label.data) {
          state.label.data = label.data
          state.label.artists = artists.data || []
          state.label.albums = albums.data || []

          if (!state.tracks.length && albums.data.length) {
            state.tracks = albums.data[0].tracks.map(adapter)
          }

          emitter.emit(state.events.DOMTITLECHANGE, setTitle(state.label.data.name))

          emitter.emit(state.events.RENDER)
        }
      } catch (err) {
        log.error(err)
      }
    }

    async function getArtist () {
      const uid = parseInt(state.params.uid, 10)
      const isNew = state.artist.data.id !== uid

      if (!isNew) {
        return emitter.emit(state.events.DOMTITLECHANGE, setTitle(state.artist.data.name))
      }

      state.artist = {
        data: {},
        tracks: []
      }

      emitter.emit(state.events.RENDER)

      try {
        const { tracks, artist } = await promiseHash({
          tracks: state.api.artists.getTracks({ uid }),
          artist: state.api.artists.findOne({ uid })
        })

        if (artist.data) {
          state.artist.data = artist.data
        }

        if (tracks.data) {
          state.artist.tracks = tracks.data.map(adapter)
          if (!state.tracks.length) {
            state.tracks = state.artist.tracks
          }
        }

        emitter.emit(state.events.DOMTITLECHANGE, setTitle(state.artist.data.name))

        emitter.emit(state.events.RENDER)
      } catch (err) {
        log.error(err)
      }
    }

    emitter.on('route:/', async () => {
      try {
        const response = await state.api.tracklists.get({ type: 'random' })

        if (response.data) {
          state.tracks = response.data.map(adapter)
          emitter.emit(state.events.RENDER)
        }
      } catch (err) {
        log.error(err)
      }
    })

    emitter.on('route:artists/:uid/tracks', getArtist)

    emitter.on('route:artists/:uid', getArtist)

    emitter.on('route:library/:type', () => {
      if (!state.api.token) {
        state.redirect = `/library/${state.params.type}`
        log.info(`Redirecting to ${state.redirect}`)
        return emitter.emit(state.events.PUSHSTATE, '/login')
      }
      const scope = `/${state.user.username}`
      emitter.emit(state.events.PUSHSTATE, scope + `/library/${state.params.type}`)
    })

    emitter.on('route::user/library/:type', async () => {
      if (!state.api.token) {
        state.redirect = state.href
        log.info(`Redirecting to ${state.redirect}`)
        return emitter.emit(state.events.PUSHSTATE, '/login')
      }

      state.tracks = []
      emitter.emit(state.events.RENDER)

      const playlist = state.cache(Playlist, `playlist-${state.params.type}`)

      const startLoader = () => {
        playlist.events.emit('loader:on')
      }
      const loaderTimeout = setTimeout(startLoader, 100)
      try {
        const user = await storage.getItem('user')

        playlist.machine.emit('start')
        const request = state.api.users.tracks[state.params.type]
        if (typeof request !== 'function') return
        const response = await request({ uid: user.uid })

        playlist.events.state.loader === 'on' && playlist.events.emit('loader:off')
        playlist.machine.emit('resolve')

        if (response.data) {
          state.tracks = response.data.map(adapter)
        }
        emitter.emit(state.events.RENDER)
      } catch (err) {
        playlist.machine.emit('reject')
        log.error(err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    })

    emitter.on('route:playlist/:type', async () => {
      state.tracks = []
      emitter.emit(state.events.RENDER)

      const playlist = state.cache(Playlist, `playlist-${state.params.type}`)

      const startLoader = () => {
        playlist.events.emit('loader:on')
      }
      const loaderTimeout = setTimeout(startLoader, 100)

      try {
        playlist.machine.emit('start')

        const response = await state.api.tracklists.get({ type: state.params.type })

        playlist.events.state.loader === 'on' && playlist.events.emit('loader:off')
        playlist.machine.emit('resolve')

        if (response.data) {
          state.tracks = response.data.map(adapter)
          emitter.emit(state.events.RENDER)
        }
      } catch (err) {
        playlist.machine.emit('reject')
        log.error(err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    })

    emitter.on('route:login', async () => {
      if (state.api.token) {
        log.info(`Redirecting to /`)
        emitter.emit(state.events.PUSHSTATE, '/')
      }
    })

    emitter.on('users:auth', async () => {
      try {
        const { user, clientId } = await promiseHash({
          user: storage.getItem('user'),
          clientId: storage.getItem('clientId')
        })

        if (user && clientId) {
          state.api = generateApi({ clientId, user })
          state.user = Object.assign(state.user, user)

          emitter.emit(state.events.RENDER)

          const response = await state.api.auth.tokens({ uid: user.uid })

          if (response.status !== 401) {
            const { accessToken: token, clientId } = response
            state.api = generateApi({ token, clientId, user: state.api.user })

            emitter.emit('api:ok')

            emitter.emit(state.events.RENDER)
          }
        } else {
          state.api = generateApi()

          emitter.emit('api:ok')

          emitter.emit(state.events.RENDER)
        }
      } catch (err) {
        log.error(err)
      }
    })

    emitter.on('logout', () => {
      state.user = { resolved: true }
      state.api = generateApi()
      storage.clear() // clear everything in indexed db
      emitter.emit(state.events.PUSHSTATE, '/login')
    })

    emitter.on(state.events.DOMCONTENTLOADED, () => {
      state.title = {
        '/': 'Dashboard',
        'labels': 'Labels',
        'artists': 'Artists',
        'labels/:uid': 'Labels',
        'artists/:uid': 'Artists',
        'tracks/:tid': 'Tracks',
        'search/:q': state.params.q ? state.params.q + ' • ' + 'Search' : 'Search',
        ':user/library/:type': {
          'favorites': 'Favorites',
          'owned': 'Owned',
          'history': 'History'
        }[state.params.type],
        'playlist/:type': {
          'top-fav': 'Top favorites',
          'latest': 'New',
          'random': 'Random',
          'top': 'Top 50',
          'staff-picks': 'Staff Picks'
        }[state.params.type]
      }[state.route]

      emitter.emit(state.events.DOMTITLECHANGE, setTitle(state.title))

      document.body.removeAttribute('unresolved') // this attribute was set to prevent fouc on chrome

      emitter.on(state.events.OFFLINE, () => {
        emitter.emit('notify', { message: 'Your browser is offline' })
      })

      emitter.on(state.events.RESIZE, () => {
        emitter.emit(state.events.RENDER)
      })

      emitter.emit('users:auth')

      emitter.on('api:ok', () => {
        state.resolved = true
        emitter.emit(state.events.RENDER)
        emitter.emit(`route:${state.route}`)
      })
    })

    emitter.on(state.events.NAVIGATE, () => {
      state.title = {
        '/': 'Dashboard',
        'labels': 'Labels',
        'artists': 'Artists',
        'labels/:uid': 'Labels',
        'artists/:uid': 'Artists',
        'tracks/:tid': 'Tracks',
        'search/:q': state.params.q ? state.params.q + ' • ' + 'Search' : 'Search',
        ':user/library/:type': {
          'favorites': 'Favorites',
          'owned': 'Owned',
          'history': 'History'
        }[state.params.type],
        'playlist/:type': {
          'top-fav': 'Top favorites',
          'latest': 'New',
          'random': 'Random',
          'top': 'Top 50',
          'staff-picks': 'Staff Picks'
        }[state.params.type]
      }[state.route]

      emitter.emit(state.events.DOMTITLECHANGE, setTitle(state.title))
      emitter.emit(`route:${state.route}`)
      window.scrollTo(0, 0)
    })

    emitter.on('storage:clear', () => {
      storage.clear()
      const timeout = 3000
      emitter.emit('notify', { timeout, message: 'Cache cleared. Reloading...' })
      setTimeout(() => {
        window.location.reload()
      }, timeout)
    })
  }
}

module.exports = app
