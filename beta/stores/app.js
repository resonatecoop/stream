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

const Labels = require('../components/labels')
const Artists = require('../components/artists')
const Playlist = require('@resonate/playlist-component')

function app () {
  return (state, emitter) => {
    state.cache(Labels, 'labels')
    state.cache(Artists, 'artists')

    Object.assign(state, {
      resolved: false,
      app: {
        onlineStatus: 'ONLINE'
      },
      api: generateApi(),
      artists: {
        items: [],
        numberOfPages: 1
      },
      artist: {
        data: {},
        topTracks: [],
        albums: [],
        tracks: []
      },
      label: {
        data: {},
        artists: [],
        albums: [],
        tracks: []
      },
      labels: {
        items: [],
        numberOfPages: 1
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
        '/': 'Dashboard',
        'labels': 'Labels',
        'artists': 'Artists',
        'labels/:uid': state.label.data.name ? state.label.data.name : '',
        'labels/:uid/albums': state.label.data.name ? state.label.data.name : '',
        'labels/:uid/artists': state.label.data.name ? state.label.data.name : '',
        'artists/:uid': state.artist.data.name ? state.artist.data.name : '',
        'artists/:uid/albums': state.artist.data.name ? state.artist.data.name : '',
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

      state.shortTitle = title

      const fullTitle = setTitle(title)

      const image = {
        'labels/:uid': state.label.data.avatar ? state.label.data.avatar.original : '',
        'artists/:uid': state.artist.data.avatar ? state.artist.data.avatar.original : ''
      }[state.route]

      emitter.emit('meta', {
        'title': fullTitle,
        'og:image': image,
        'twitter:card': 'summary_large_image',
        'twitter:title': fullTitle,
        'twitter:image': image,
        'twitter:site': '@resonatecoop'
      })
    }

    emitter.on('route:labels', async () => {
      const { loader, machine } = state.components['labels']

      const startLoader = () => {
        loader.emit('loader:toggle')
      }

      const loaderTimeout = setTimeout(startLoader, 300)

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        machine.emit('start')

        const response = await state.api.labels.find({ page: pageNumber - 1, limit: 20 })

        loader.emit('loader:toggle')
        machine.emit('resolve')

        if (response.data) {
          state.labels.items = response.data
          state.labels.numberOfPages = response.numberOfPages
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        machine.emit('reject')
        log.error(err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    })

    emitter.on('route:labels/:uid', getLabel)
    emitter.on('route:labels/:uid/albums', getLabelAlbums)
    emitter.on('route:labels/:uid/artists', getLabelArtists)

    async function getLabel () {
      try {
        const uid = parseInt(state.params.uid, 10)
        const isNew = state.label.data.id !== uid

        if (isNew) {
          state.label = {
            data: {},
            topTracks: [],
            artists: [],
            albums: [],
            tracks: []
          }

          emitter.emit(state.events.RENDER)
        } else {
          setMeta()
        }

        const { albums, artists, label } = await promiseHash({
          albums: state.api.labels.getAlbums({ uid, limit: 5 }),
          artists: state.api.labels.getArtists({ uid, limit: 20 }),
          label: state.api.labels.findOne({ uid })
        })

        if (label.data) {
          state.label.data = label.data
          state.label.artists = artists.data || []
          state.label.albums = albums.data || []

          if (!state.tracks.length && albums.data.length) {
            state.tracks = albums.data[0].tracks.map(adapter)
          }

          setMeta()

          emitter.emit(state.events.RENDER)
        }
      } catch (err) {
        log.error(err)
      }
    }

    async function getLabelAlbums () {
      const uid = parseInt(state.params.uid, 10)
      const isNew = state.artist.data.id !== uid

      if (isNew) {
        state.label = {
          data: {},
          topTracks: [],
          artists: [],
          albums: [],
          tracks: []
        }

        emitter.emit(state.events.RENDER)
      } else {
        setMeta()
      }

      const pageNumber = state.query.page ? Number(state.query.page) : 1

      try {
        const { label, albums } = await promiseHash({
          albums: state.api.labels.getAlbums({ uid, limit: 5, page: pageNumber - 1 }),
          label: state.api.labels.findOne({ uid })
        })

        state.label.data = label.data || {}
        state.label.albums = albums.data || []

        setMeta()

        emitter.emit(state.events.RENDER)
      } catch (err) {
        log.error(err)
      }
    }

    async function getLabelArtists () {
      const uid = parseInt(state.params.uid, 10)
      const isNew = state.artist.data.id !== uid

      if (isNew) {
        state.label = {
          data: {},
          artists: [],
          albums: [],
          tracks: []
        }

        emitter.emit(state.events.RENDER)
      } else {
        setMeta()
      }

      const pageNumber = state.query.page ? Number(state.query.page) : 1

      try {
        const { label, artists } = await promiseHash({
          artists: state.api.labels.getArtists({ uid, limit: 20, page: pageNumber - 1 }),
          label: state.api.labels.findOne({ uid })
        })

        state.label.data = label.data || {}
        state.label.artists = artists.data || []

        setMeta()

        emitter.emit(state.events.RENDER)
      } catch (err) {
        log.error(err)
      }
    }

    async function getArtistAlbums () {
      const uid = parseInt(state.params.uid, 10)
      const isNew = state.artist.data.id !== uid

      if (isNew) {
        state.artist = {
          data: {},
          tracks: [],
          albums: [],
          topTracks: []
        }

        emitter.emit(state.events.RENDER)
      } else {
        setMeta()
      }

      const pageNumber = state.query.page ? Number(state.query.page) : 1

      try {
        const albums = await state.api.artists.getAlbums({ uid, limit: 5, page: pageNumber - 1 })

        state.artist.albums = albums.data || []

        setMeta()

        emitter.emit(state.events.RENDER)
      } catch (err) {
        log.error(err)
      }
    }

    async function getArtist () {
      const uid = parseInt(state.params.uid, 10)
      const isNew = state.artist.data.id !== uid

      if (isNew) {
        state.artist = {
          data: {},
          tracks: [],
          albums: [],
          topTracks: []
        }

        emitter.emit(state.events.RENDER)
      } else {
        setMeta()
      }

      try {
        const { topTracks, tracks, albums, artist } = await promiseHash({
          topTracks: state.api.artists.getTopTracks({ uid, limit: 5 }),
          tracks: state.api.artists.getTracks({ uid, limit: 10 }),
          albums: state.api.artists.getAlbums({ uid, limit: 5, page: 0 }),
          artist: state.api.artists.findOne({ uid })
        })

        if (artist.data) {
          state.artist.data = artist.data
          state.artist.albums = albums.data || []
        }

        if (tracks.data) {
          state.artist.tracks = tracks.data.map(adapter)
        }

        if (topTracks.data) {
          state.artist.topTracks = topTracks.data.map(adapter)

          if (!state.tracks.length) {
            state.tracks = state.artist.topTracks
          }
        }

        setMeta()

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

    emitter.on('route:artists/:uid/albums', getArtistAlbums)

    emitter.on('route:artists/:uid/tracks', getArtist)

    emitter.on('route:artists', async () => {
      const { loader, machine } = state.components['artists']
      const startLoader = () => {
        loader.emit('loader:toggle')
      }

      const loaderTimeout = setTimeout(startLoader, 300)

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        machine.emit('start')

        const response = await state.api.artists.find({
          page: pageNumber - 1,
          limit: 20,
          order: 'desc',
          order_by: 'id'
        })

        loader.emit('loader:toggle')
        machine.emit('resolve')

        if (response.data) {
          state.artists.items = response.data
          state.artists.numberOfPages = response.numberOfPages
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        machine.emit('reject')
        log.error(err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    })

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

      const id = `playlist-${state.params.type}`
      const { machine, events } = state.components[id] || state.cache(Playlist, id).local

      const startLoader = () => {
        events.emit('loader:on')
      }
      const loaderTimeout = setTimeout(startLoader, 300)
      try {
        const user = await storage.getItem('user')
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        machine.emit('start')

        const request = state.api.users.tracks[state.params.type]

        if (typeof request !== 'function') return

        const response = await request({ uid: user.uid, limit: 50, page: pageNumber - 1 })

        events.state.loader === 'on' && events.emit('loader:off')
        machine.emit('resolve')

        if (response.data) {
          state.tracks = response.data.map(adapter)
          state.numberOfPages = response.numberOfPages || 1
        }
        emitter.emit(state.events.RENDER)
      } catch (err) {
        machine.emit('reject')
        log.error(err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    })

    emitter.on('route:playlist/:type', async () => {
      state.tracks = []

      emitter.emit(state.events.RENDER)

      const { machine, events } = state.components[`playlist-${state.params.type}`] || state.cache(Playlist, `playlist-${state.params.type}`).local

      const startLoader = () => {
        events.emit('loader:on')
      }
      const loaderTimeout = setTimeout(startLoader, 300)

      try {
        machine.emit('start')

        const pageNumber = state.query.page ? Number(state.query.page) : 1
        const response = await state.api.tracklists.get({ type: state.params.type, limit: 50, page: pageNumber - 1 })

        events.state.loader === 'on' && events.emit('loader:off')
        machine.emit('resolve')

        if (response.data) {
          state.tracks = response.data.map(adapter)
          state.numberOfPages = response.numberOfPages || 1
          emitter.emit(state.events.RENDER)
        }
      } catch (err) {
        machine.emit('reject')
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
      state.user = {}
      state.api = generateApi()
      storage.clear() // clear everything in indexed db
      emitter.emit(state.events.PUSHSTATE, '/login')
    })

    emitter.on(state.events.DOMCONTENTLOADED, () => {
      setMeta()

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
      setMeta()
      emitter.emit(`route:${state.route}`)
      window.scrollTo(0, 0)
    })

    emitter.on('credits:set', async (credits) => {
      const user = await storage.getItem('user')
      user.credits = credits
      state.user = user
      await storage.setItem('user', user)
      emitter.emit('notify', { timeout: 3000, message: 'You credits have been topped up' })
      emitter.emit(state.events.RENDER)
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
