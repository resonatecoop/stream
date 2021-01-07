const nanologger = require('nanologger')
const log = nanologger('store:artists')
const adapter = require('@resonate/schemas/adapters/v1/track')
const setTitle = require('../lib/title')
const generateApi = require('../lib/api')
const Profiles = require('../components/profiles')
const Albums = require('../components/albums')
const Playlist = require('@resonate/playlist-component')
const api = generateApi({
  domain: 'api.resonate.is'
})

module.exports = artists

/*
 * @description Store for artists
 */

function artists () {
  return (state, emitter) => {
    state.artists = state.artists || {
      items: [],
      numberOfPages: 1
    }

    state.artist = state.artist || {
      data: {},
      label: {},
      artists: {
        items: [],
        numberOfPages: 1
      },
      albums: {
        items: [],
        numberOfPages: 1
      },
      latestRelease: {
        items: []
      },
      topTracks: {
        items: []
      },
      tracks: []
    }

    emitter.once('prefetch:artist', async (id) => {
      if (!state.prefetch) return

      try {
        const request = state.apiv2.artists.findOne({ id: id })

        state.prefetch.push(request)

        const response = await request

        if (response.data) {
          state.artist.data = response.data
        }

        setMeta()
      } catch (err) {
        log.error(err)
      }
    })

    emitter.on('artists:clear', () => {
      state.artist = {
        data: {},
        notFound: false,
        tracks: [],
        artists: {
          items: [],
          numberOfPages: 1
        },
        albums: {
          items: [],
          numberOfPages: 1
        },
        latestRelease: {
          items: []
        },
        topTracks: {
          items: []
        },
        label: {}
      }

      emitter.emit(state.events.RENDER)
    })

    emitter.on('route:artists', async () => {
      setMeta()

      state.cache(Profiles, 'artists')

      const component = state.components.artists
      const { machine } = component

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setTimeout(() => {
        machine.emit('loader:toggle')
      }, 1000)

      const pageNumber = state.query.page ? Number(state.query.page) : 1

      machine.emit('request:start')

      try {
        const response = await api.artists.find({
          page: pageNumber - 1,
          limit: 50,
          order: 'desc',
          order_by: 'id'
        })

        machine.emit('loader:toggle')
        machine.emit('request:resolve')

        if (response.data) {
          state.artists.items = response.data
          state.artists.numberOfPages = response.numberOfPages
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        component.error = err
        machine.emit('request:reject')
        emitter.emit('error', err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    })

    emitter.on('route:artist/:id/albums', getArtist)
    emitter.on('route:artist/:id', getArtist)

    async function getArtist () {
      const id = Number(state.params.id.split('-')[0])
      const isNew = !state.artist.data || state.artist.data.id !== id

      state.cache(Profiles, `labels-${id}`)

      const component = state.components[`labels-${id}`]

      const { machine } = component// member of

      if (isNew) {
        emitter.emit('artists:clear')
      } else {
        setMeta()
      }

      machine.emit('request:start')

      try {
        const response = await state.apiv2.artists.findOne({ id: id })

        if (!response.data) {
          state.artist.notFound = true
        } else {
          state.artist.data = response.data

          machine.emit('request:resolve')

          emitter.emit(state.events.RENDER)

          getArtistAlbums()
          getLatestRelease()
          getTopTracks()
        }
      } catch (err) {
        emitter.emit('error', err)
        machine.emit('request:reject')
        log.error(err)
      } finally {
        emitter.emit(state.events.RENDER)
        setMeta()
      }
    }

    function setMeta () {
      const { name, images = {}, description } = state.artist.data

      const title = {
        artists: 'Artists',
        'artist/:id': name,
        'artist/:id/albums': name,
        'artist/:id/releases': name,
        'artist/:id/album/:slug': name
      }[state.route]

      if (!title) return

      state.shortTitle = title

      const image = {
        'artist/:id': images['profile_photo-l'] || '' // fallback
      }[state.route]

      const cover = {
        'artist/:id': images['cover_photo-l'] || '' // fallback ?
      }[state.route]

      state.meta = {
        title: setTitle(title),
        'og:title': setTitle(title),
        'og:type': 'website',
        'og:url': 'https://beta.stream.resonate.coop' + state.href,
        'og:description': description || `Listen to ${name} on Resonate`,
        'twitter:card': 'summary_large_image',
        'twitter:title': setTitle(title),
        'twitter:site': '@resonatecoop'
      }

      if (image) {
        state.meta['og:image'] = image
        state.meta['twitter:image'] = cover || image
      }

      emitter.emit('meta', state.meta)
    }

    async function getArtistAlbums () {
      const id = Number(state.params.id)

      state.cache(Albums, 'artist-albums-' + id)

      const { events, machine } = state.components['artist-albums-' + id]

      const loaderTimeout = setTimeout(() => {
        events.emit('loader:toggle')
      }, 300)

      machine.emit('start')

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1
        const response = await state.api.artists.getAlbums({
          uid: id,
          limit: 5,
          page: pageNumber - 1
        })

        if (events.state.loader === 'on') {
          events.emit('loader:toggle')
        }

        if (!response.data) {
          machine.emit('notFound')
        }

        if (response.data) {
          state.artist.albums.items = response.data || []
          state.artist.albums.count = response.count
          state.artist.albums.numberOfPages = response.numberOfPages

          machine.emit('resolve')

          if (!state.tracks.length) {
            state.tracks = response.data[0].tracks.map(adapter)
          }
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        log.error(err)
        machine.emit('reject')
      } finally {
        setMeta()
        clearTimeout(loaderTimeout)
      }
    }

    async function getLatestRelease () {
      const id = Number(state.params.id)
      const response = await api.artists.getLatestRelease({ uid: id, limit: 1 })

      if (response.data) {
        state.artist.latestRelease.items = response.data

        emitter.emit(state.events.RENDER)
      }
    }

    async function getTopTracks (limit = 10) {
      const id = Number(state.params.id)
      const cid = `top-tracks-artist-${id}`

      state.cache(Playlist, cid)

      const component = state.components[cid]
      const { machine, events } = component

      const loaderTimeout = setTimeout(() => {
        events.emit('loader:on')
      }, 300)

      machine.emit('start')

      try {
        const topTracks = await state.api.artists.getTopTracks({ uid: id, limit: 3 })

        if (events.state.loader === 'on') {
          events.emit('loader:off')
        }

        if (topTracks.data) {
          state.artist.topTracks.items = topTracks.data.map(adapter)

          if (!state.tracks.length) {
            state.tracks = state.artist.topTracks.items
          }

          machine.emit('resolve')
        } else {
          machine.emit('404')
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        log.error(err)
        machine.emit('reject')
      } finally {
        clearTimeout(loaderTimeout)
      }
    }
  }
}
