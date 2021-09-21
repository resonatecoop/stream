const nanologger = require('nanologger')
const log = nanologger('store:labels')
const setTitle = require('../lib/title')
const Profiles = require('../components/profiles')
const Discography = require('../components/discography')
const setLoaderTimeout = require('../lib/loader-timeout')
const { getAPIServiceClient, getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST
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
      discography: {
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
      setMeta()

      state.cache(Profiles, 'labels')

      const component = state.components.labels
      const { machine } = component

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setLoaderTimeout(machine)
      const pageNumber = state.query.page ? Number(state.query.page) : 1

      machine.emit('request:start')

      try {
        const client = await getAPIServiceClient('labels')

        const response = await client.getLabels({
          page: pageNumber,
          limit: 50
        })

        const { data, pages } = response.body

        machine.emit('request:resolve')

        state.labels.items = data
        state.labels.numberOfPages = pages

        setMeta()

        emitter.emit(state.events.RENDER)
      } catch (err) {
        component.error = err
        machine.emit('request:reject')
        emitter.emit('error', err)
      } finally {
        machine.state.loader === 'on' && machine.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
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
            discography: {
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

        const client = await getAPIServiceClient('labels')
        const result = await client.getLabel({ id })
        const { body: response } = result

        state.label.data = response.data

        emitter.emit(state.events.RENDER)

        getLabelAlbums()
        getLabelArtists()
        getLabelAlbums2()
      } catch (err) {
        state.label.notFound = err.status === 404
        log.error(err)
      } finally {
        setMeta()
        emitter.emit(state.events.RENDER)
      }
    })

    emitter.on('route:label/:id/releases', getLabelAlbums)
    emitter.on('route:label/:id/artists', getLabelArtists)

    emitter.once('prefetch:labels', async () => {
      if (!state.prefetch) return

      setMeta()

      state.labels = state.labels || {
        items: [],
        numberOfPages: 1
      }

      const pageNumber = state.query.page ? Number(state.query.page) : 1

      const request = new Promise((resolve, reject) => {
        (async () => {
          try {
            const client = await getAPIServiceClient('labels')

            // get latest updated artists from v2 api
            const result = await client.getLabels({
              page: pageNumber,
              limit: 50
            })

            return resolve(result.body)
          } catch (err) {
            return reject(err)
          }
        })()
      })

      state.prefetch.push(request)

      const result = await request

      const { data, pages } = result.body

      if (data) {
        state.labels.items = data
        state.labels.numberOfPages = pages
      }
    })

    emitter.once('prefetch:label', async (id) => {
      if (!state.prefetch) return

      try {
        const request = new Promise((resolve, reject) => {
          (async () => {
            try {
              const client = await getAPIServiceClient('labels')

              // get latest updated artists from v2 api
              const result = await client.getLabel({
                id: id
              })

              return resolve(result.body)
            } catch (err) {
              return reject(err)
            }
          })()
        })

        state.prefetch.push(request)

        const result = await request

        const { data } = result.body

        if (data) {
          state.label.data = data
        }

        setMeta()
      } catch (err) {
        log.error(err)
      }
    })

    async function getLabelAlbums () {
      const id = Number(state.params.id)

      state.cache(Discography, 'label-discography-' + id)

      const { events, machine } = state.components['label-discography-' + id]

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setLoaderTimeout(events)

      machine.emit('start')

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        const client = await getAPIServiceClient('labels')

        const result = await client.getLabelReleases({
          id: id,
          limit: 5,
          page: pageNumber
        })

        const { body: response } = result
        const { data: albums } = response

        state.label.discography.items = albums.map((item) => {
          return Object.assign({}, item, {
            items: item.items.map((item) => {
              return {
                count: 0,
                fav: 0,
                track_group: [
                  {
                    title: item.track.album,
                    display_artist: item.track.artist
                  }
                ],
                track: item.track,
                url: item.track.url || `https://api.resonate.is/v1/stream/${item.track.id}`
              }
            })
          })
        })
        state.label.discography.count = response.count
        state.label.discography.numberOfPages = response.numberOfPages || 1

        let counts = {}

        if (state.user.uid) {
          const ids = [...new Set(albums.map((item) => {
            return item.items.map(({ track }) => track.id)
          }).flat(1))]

          const getClient = getAPIServiceClientWithAuth(state.user.token)
          const client = await getClient('plays')

          const result = await client.resolvePlays({
            plays: {
              ids: ids
            }
          })

          const { body: response } = result

          counts = response.data.reduce((o, item) => {
            o[item.track_id] = item.count
            return o
          }, {})

          state.label.discography.items = state.label.discography.items.map((item) => {
            return Object.assign({}, item, {
              items: item.items.map((item) => {
                return Object.assign({}, item, {
                  count: counts[item.track.id] || 0
                })
              })
            })
          })
        }

        machine.emit('resolve')

        if (!state.tracks.length && state.label.discography.items.length) {
          state.tracks = state.label.discography.items[0].items
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        if (err.status === 404) {
          machine.emit('notFound')
        } else {
          log.error(err)
          machine.emit('reject')
        }
      } finally {
        events.state.loader === 'on' && events.emit('loader:toggle')
        setMeta()
        clearTimeout(await loaderTimeout)
      }
    }

    async function getLabelAlbums2 () {
      const id = Number(state.params.id)

      state.cache(Discography, 'label-albums-' + id)

      const { events, machine } = state.components['label-albums-' + id]

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setLoaderTimeout(events)

      machine.emit('start')

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        const client = await getAPIServiceClient('labels')
        const result = await client.getLabelAlbums({
          id: id,
          limit: 5,
          various: true,
          page: pageNumber
        })

        const { body: response } = result

        state.label.albums.items = response.data.map((item) => {
          return Object.assign({}, item, {
            various: true,
            items: item.items.map((item) => {
              return {
                count: 0,
                fav: 0,
                track_group: [
                  {
                    title: item.album,
                    display_artist: item.artist
                  }
                ],
                track: item,
                url: item.url || `https://api.resonate.is/v1/stream/${item.id}`
              }
            })
          })
        })
        state.label.albums.count = response.count
        state.label.albums.numberOfPages = response.numberOfPages || 1

        machine.emit('resolve')

        emitter.emit(state.events.RENDER)
      } catch (err) {
        log.error(err)
        machine.emit('reject')
      } finally {
        events.state.loader === 'on' && events.emit('loader:toggle')
        setMeta()
        clearTimeout(await loaderTimeout)
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
        machine.state.loader === 'off' && machine.emit('loader:toggle')
      }, 500)
      const pageNumber = state.query.page ? Number(state.query.page) : 1

      machine.emit('request:start')

      try {
        const client = await getAPIServiceClient('labels')

        const result = await client.getLabelArtists({
          id,
          limit: 20,
          page: pageNumber
        })

        const { body: response } = result
        const { data, count = 0, numberOfPages: pages = 1 } = response

        machine.emit('request:resolve')

        state.label.artists.items = data
        state.label.artists.count = count
        state.label.artists.numberOfPages = pages

        setMeta()
        emitter.emit(state.events.RENDER)
      } catch (err) {
        if (err.status === 404) {
          machine.emit('request:noResults')
        } else {
          machine.emit('request:reject')
          component.error = err
          log.error(err)
        }
      } finally {
        machine.state.loader === 'on' && machine.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
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
