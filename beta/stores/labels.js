const promiseHash = require('promise-hash/lib/promise-hash')
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

    function setMeta () {
      const { name, id, avatar = {}, description } = state.label.data

      const title = {
        labels: 'Labels',
        'label/:id': name,
        'label/:id/album/:slug': name,
        'label/:id/releases': name,
        'label/:id/artists': name
      }[state.route]

      if (!title) return

      state.shortTitle = title

      state.title = setTitle(title)
      state.shortTitle = title

      const image = {
        'labels/:id': avatar.original || ''
      }[state.route]

      const cover = {
        'labels/:id': avatar.cover || ''
      }[state.route]

      state.meta = {
        title: state.title,
        'og:image': image,
        'og:title': state.title,
        'og:type': 'website',
        'og:url': `https://beta.resonate.is/labels/${id}`,
        'og:description': description || `Listen to ${name} on Resonate`,
        'twitter:card': 'summary_large_image',
        'twitter:title': state.title,
        'twitter:image': cover || image,
        'twitter:site': '@resonatecoop'
      }

      emitter.emit('meta', state.meta)
    }

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

        if (events.state.loader === 'on') {
          events.emit('loader:toggle')
        }

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
        clearTimeout(loaderTimeout)
      }
    }

    async function getLabelArtists () {
      const id = Number(state.params.id)

      state.cache(Profiles, 'label-artists-' + id)

      const { machine } = state.components['label-artists-' + id]

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setTimeout(() => {
        machine.emit('loader:toggle')
      }, 1000)
      const pageNumber = state.query.page ? Number(state.query.page) : 1

      machine.emit('request:start')

      try {
        const { artists } = await promiseHash({
          artists: state.api.labels.getArtists({ id, limit: 20, page: pageNumber - 1 })
        })

        machine.emit('loader:toggle')
        machine.emit('request:resolve')

        state.label.artists.count = artists.count
        state.label.artists.items = artists.data || []
        state.label.artists.numberOfPages = artists.numberOfPages || 1

        setMeta()
        emitter.emit(state.events.RENDER)
      } catch (err) {
        machine.emit('request:reject')
        log.error(err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    }
  }
}
