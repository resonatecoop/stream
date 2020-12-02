const promiseHash = require('promise-hash/lib/promise-hash')
const nanologger = require('nanologger')
const log = nanologger('store:labels')
const setTitle = require('../lib/title')
const Artists = require('../components/artists')
const Labels = require('../components/labels')
const Albums = require('../components/albums')
const generateApi = require('../lib/api')
const api = generateApi({
  domain: 'api.resonate.is'
})

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

    state.cache(Labels, 'labels')

    emitter.on('route:labels', async () => {
      setMeta()

      const { events, machine } = state.components.labels

      if (machine.state === 'loading') {
        return
      }

      const startLoader = () => {
        events.emit('loader:toggle')
      }

      const loaderTimeout = setTimeout(startLoader, 1000)

      machine.emit('start')

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        const response = await api.labels.find({ page: pageNumber - 1, limit: 50 })

        events.emit('loader:toggle')
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

    emitter.on('route:label/:id/albums', getLabelAlbums)
    emitter.on('route:label/:id/artists', getLabelArtists)

    emitter.once('prefetch:labels', () => {
      if (!state.prefetch) return

      setMeta()

      state.labels = state.labels || {
        items: [],
        numberOfPages: 1
      }

      const pageNumber = state.query.page ? Number(state.query.page) : 1
      const request = api.labels.find({
        page: pageNumber - 1,
        limit: 20
      }).then(response => {
        if (response.data) {
          state.labels.items = response.data
          state.labels.numberOfPages = response.numberOfPages
        }

        emitter.emit(state.events.RENDER)
      }).catch(err => {
        console.log(err)
        emitter.emit('error', err)
      })

      state.prefetch.push(request)
    })

    emitter.once('prefetch:label', (id) => {
      if (!state.prefetch) return

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

      const request = state.apiv2.labels.findOne({ id: id }).then(response => {
        if (response.data) {
          state.label.data = response.data
        }

        setMeta()

        emitter.emit(state.events.RENDER)
      }).catch(err => {
        console.log(err)
        emitter.emit('error', err)
      })

      state.prefetch.push(request)
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

      state.cache(Artists, 'label-artists-' + id)

      const { events, machine } = state.components['label-artists-' + id]

      if (machine.state === 'loading') {
        return
      }

      const loaderTimeout = setTimeout(() => {
        events.emit('loader:toggle')
      }, 1000)
      const pageNumber = state.query.page ? Number(state.query.page) : 1

      machine.emit('start')

      try {
        const { artists } = await promiseHash({
          artists: api.labels.getArtists({ id, limit: 20, page: pageNumber - 1 })
        })

        events.emit('loader:toggle')
        machine.emit('resolve')

        state.label.artists.count = artists.count
        state.label.artists.items = artists.data || []
        state.label.artists.numberOfPages = artists.numberOfPages || 1

        setMeta()
        emitter.emit(state.events.RENDER)
      } catch (err) {
        machine.emit('reject')
        log.error(err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    }
  }
}
