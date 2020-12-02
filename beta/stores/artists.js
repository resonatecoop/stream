const promiseHash = require('promise-hash/lib/promise-hash')
const nanologger = require('nanologger')
const log = nanologger('store:artists')
const adapter = require('@resonate/schemas/adapters/v1/track')
const setTitle = require('../lib/title')
const generateApi = require('../lib/api')
const Artists = require('../components/artists')
const Albums = require('../components/albums')
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

        emitter.emit(state.events.RENDER)

        setMeta()
      } catch (err) {
        emitter.emit('error', err)
      }
    })

    emitter.on('artists:clear', () => {
      state.artist = {
        data: {},
        notFound: false,
        tracks: [],
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
      state.cache(Artists, 'artists')

      setMeta()

      const { events, machine } = state.components.artists

      if (machine.state === 'loading') {
        return
      }

      const loaderTimeout = setTimeout(() => {
        events.emit('loader:toggle')
      }, 1000)
      const pageNumber = state.query.page ? Number(state.query.page) : 1

      machine.emit('start')

      try {
        const response = await api.artists.find({
          page: pageNumber - 1,
          limit: 50,
          order: 'desc',
          order_by: 'id'
        })

        events.emit('loader:toggle')
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

    emitter.on('route:artist/:id', async () => {
      const id = Number(state.params.id.split('-')[0])
      const isNew = !state.artist.data || state.artist.data.id !== id

      if (isNew) {
        emitter.emit('artists:clear')
      } else {
        setMeta()
      }

      try {
        const response = await state.apiv2.artists.findOne({ id: id })

        if (!response.data) {
          state.artist.notFound = true
        } else {
          state.artist.data = response.data

          emitter.emit(state.events.RENDER)

          getArtistAlbums()
        }
      } catch (err) {
        emitter.emit('error', err)
        log.error(err)
      } finally {
        emitter.emit(state.events.RENDER)
        setMeta()
      }
    })

    function setMeta () {
      const { name, images = {}, description } = state.artist.data

      const title = {
        artists: 'Artists',
        'artist/:id': name,
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
      const uid = Number(state.params.uid)
      const response = await api.artists.getLatestRelease(uid)

      if (response.data) {
        state.artist.latestRelease.items = response.data

        emitter.emit(state.events.RENDER)
      }
    }

    async function getTracks (limit = 10) {
      const uid = Number(state.params.uid)
      const { tracks, topTracks } = await promiseHash({
        tracks: api.artists.getTracks(uid, limit),
        topTracks: api.artists.getTopTracks(uid, 5)
      })

      if (topTracks.data) {
        state.artist.topTracks.items = topTracks.data.map(adapter)

        if (!state.tracks.length) {
          state.tracks = state.artist.topTracks.items
        }

        emitter.emit(state.events.RENDER)
      } else if (tracks.data) {
        state.artist.tracks = tracks.data.map(adapter)

        if (!state.tracks.length) {
          state.tracks = state.artist.tracks
        }

        emitter.emit(state.events.RENDER)
      }
    }
  }
}
