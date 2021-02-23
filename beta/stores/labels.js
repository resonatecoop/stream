const nanologger = require('nanologger')
const log = nanologger('store:labels')
const setTitle = require('../lib/title')
const Profiles = require('../components/profiles')
const Albums = require('../components/albums')

module.exports = labels

/*
 * @description Store for labels
 */

function labels () {
  return (state, emitter) => {
    state.label = state.label || {
      data: {},
      artists: {
        items: [],
        numberOfPages: 1
      },
      albums: {
        items: [],
        numberOfPages: 1
      },
      tracks: []
    }

    state.labels = state.labels || {
      items: [],
      numberOfPages: 1
    }

    emitter.on('route:labels', async () => {
      state.cache(Profiles, 'labels')

      const component = state.components.labels

      setMeta()

      const { machine } = component

      if (machine.state.request === 'loading') {
        return
      }

      const startLoader = () => {
        machine.emit('loader:toggle')
      }

      const loaderTimeout = setTimeout(startLoader, 1000)

      machine.emit('request:start')

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        const response = await state.api.labels.find({ page: pageNumber - 1, limit: 50 })

        machine.emit('loader:toggle')
        machine.emit('request:resolve')

        if (response.data) {
          state.labels.items = response.data
          state.labels.numberOfPages = response.numberOfPages
        }

        setMeta()

        emitter.emit(state.events.RENDER)
      } catch (err) {
        component.error = err
        machine.emit('request:reject')
        emitter.emit('error', err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    })

    emitter.on('route:label/:id', async () => {
      const id = Number(state.params.id.split('-')[0])

      try {
        if (isNaN(id)) {
          return emitter.emit(state.events.PUSHSTATE, '/')
        }

        const isNew = !state.label.data || state.label.data.id !== id

        if (isNew) {
          state.label = {
            notFound: false,
            data: {},
            topTracks: [],
            artists: {
              items: [],
              numberOfPages: 1
            },
            albums: {
              items: [],
              numberOfPages: 1
            },
            tracks: []
          }

          emitter.emit(state.events.RENDER)
        } else {
          setMeta()
        }

        const response = await state.apiv2.labels.findOne({ id })

        if (!response.data) {
          state.label.notFound = true
        } else {
          state.label.data = response.data

          emitter.emit(state.events.RENDER)

          getLabelAlbums()
          getLabelArtists()
        }
      } catch (err) {
        log.error(err)
      } finally {
        setMeta()
        emitter.emit(state.events.RENDER)
      }
    })

    emitter.on('route:label/:id/releases', getLabelAlbums)
    emitter.on('route:label/:id/artists', getLabelArtists)

    emitter.once('prefetch:labels', () => {
      if (!state.prefetch) return

      setMeta()

      state.labels = state.labels || {
        items: [],
        numberOfPages: 1
      }

      const pageNumber = state.query.page ? Number(state.query.page) : 1
      const request = state.api.labels.find({
        page: pageNumber - 1,
        limit: 20
      }).then(response => {
        if (response.data) {
          state.labels.items = response.data
          state.labels.numberOfPages = response.numberOfPages
        }

        emitter.emit(state.events.RENDER)
      }).catch(err => {
        emitter.emit('error', err)
      })

      state.prefetch.push(request)
    })

    emitter.once('prefetch:label', async (id) => {
      if (!state.prefetch) return

      try {
        const request = state.apiv2.labels.findOne({ id: id })

        state.prefetch.push(request)

        const response = await request

        if (response.data) {
          state.label.data = response.data
        }

        setMeta()
      } catch (err) {
        log.error(err)
      }
    })

    async function getLabelAlbums () {
      const id = Number(state.params.id)

      state.cache(Albums, 'label-albums-' + id)

      const { events, machine } = state.components['label-albums-' + id]

      const loaderTimeout = setTimeout(() => {
        events.emit('loader:toggle')
      }, 300)

      machine.emit('start')

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        const response = await state.api.labels.getAlbums({
          id,
          limit: 5,
          page: pageNumber - 1
        })

        events.state.loader === 'on' && events.emit('loader:toggle')

        if (!response.data) {
          machine.emit('notFound')
        }

        if (response.data) {
          state.label.albums.items = response.data || []
          state.label.albums.count = response.count
          state.label.albums.numberOfPages = response.numberOfPages || 1

          machine.emit('resolve')
          setMeta()
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        log.error(err)
        machine.emit('reject')
      } finally {
        events.state.loader === 'on' && events.emit('loader:toggle')
        clearTimeout(loaderTimeout)
      }
    }

    async function getLabelArtists () {
      const id = Number(state.params.id)

      state.cache(Profiles, 'label-artists-' + id)

      const component = state.components['label-artists-' + id]

      const { machine } = component

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setTimeout(() => {
        machine.emit('loader:toggle')
      }, 500)
      const pageNumber = state.query.page ? Number(state.query.page) : 1

      machine.emit('request:start')

      try {
        const { data, count = 0, numberOfPages: pages = 1, status } = await state.api.labels.getArtists({ id, limit: 20, page: pageNumber - 1 })

        machine.state.loader === 'on' && machine.emit('loader:toggle')
        machine.emit('request:resolve')

        if (data) {
          state.label.artists.items = data
        } else if (status === 404) {
          machine.emit('request:noResults')
        }

        state.label.artists.count = count
        state.label.artists.numberOfPages = pages

        setMeta()
        emitter.emit(state.events.RENDER)
      } catch (err) {
        machine.emit('request:reject')
        component.error = err
        log.error(err)
      } finally {
        machine.state.loader === 'on' && machine.emit('loader:toggle')
        clearTimeout(loaderTimeout)
      }
    }

    function setMeta () {
      const { name, images = {}, description } = state.label.data

      const title = {
        labels: 'Labels',
        'label/:id': name,
        'label/:id/album/:slug': name,
        'label/:id/releases': name,
        'label/:id/artists': name
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
  }
}
