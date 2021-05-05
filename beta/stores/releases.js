/* global fetch */

const setTitle = require('../lib/title')
const Playlist = require('@resonate/playlist-component')
const List = require('../components/trackgroups')
const LoaderTimeout = require('../lib/loader-timeout')
const hash = require('promise-hash/lib/promise-hash')

function releases () {
  return (state, emitter) => {
    state.cache(List, 'featured-releases')
    state.cache(List, 'latest-releases')

    state.featuredReleases = state.featuredReleases || {
      items: []
    }

    state.releases = state.releases || {
      items: []
    }

    state.release = state.release || {
      data: {},
      tracks: []
    }

    emitter.once('prefetch:release', async () => {
      if (!state.prefetch) return

      try {
        const request = new Promise((resolve, reject) => {
          (async () => {
            try {
              const { href } = new URL(state.href, `https://${process.env.APP_DOMAIN}`)
              const response = await (await fetch(`https://${process.env.API_DOMAIN}/api/v2/resolve?url=${href}`)).json()

              if (response.data) {
                const result = await state.apiv2.trackgroups.findOne({ id: response.data.id })
                return resolve(result)
              }

              return resolve()
            } catch (err) {
              return reject(err)
            }
          })()
        })

        state.prefetch.push(request)

        const response = await request

        if (response) {
          state.release.data = response.data
        }

        emitter.emit(state.events.RENDER)

        setMeta()
      } catch (err) {
        emitter.emit('error', err)
      }
    })

    emitter.once('prefetch:discovery', async () => {
      if (!state.prefetch) return

      try {
        const request = state.apiv2.releases.find({
          featured: true,
          page: 1,
          limit: 15
        })

        state.prefetch.push(request)

        const response = await request
        if (response.data) {
          state.featuredReleases.items = response.data
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        emitter.emit('error', err)
      }
    })

    emitter.once('prefetch:releases', async () => {
      if (!state.prefetch) return

      setMeta()

      const order = state.query.order || 'newest'
      const limit = state.query.limit || 20
      const page = state.query.page || 1

      const payload = {
        page: page,
        limit: limit,
        order: order
      }

      try {
        const request = state.apiv2.releases.find(payload)

        state.prefetch.push(request)

        const response = await request

        if (response.data) {
          state.releases.items = response.data
          state.releases.count = response.count
          state.releases.pages = response.numberOfPages || 1
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        emitter.emit('error', err)
      }
    })

    emitter.on('releases:find', async (props = {}) => {
      const component = state.components[!props.featured ? 'latest-releases' : 'featured-releases']
      const { machine } = component

      if (machine.state.request === 'loading') {
        return
      }

      state.releases.count = 0
      state.releases.pages = 0
      state.releases.items = []

      emitter.emit(state.events.RENDER)

      const loaderTimeout = LoaderTimeout(machine)

      machine.emit('request:start')

      const limit = props.limit || 20
      const page = props.page || 1

      const payload = {
        limit: limit,
        page: page
      }

      if (props.type) {
        payload.type = props.type
      }

      if (props.featured) {
        payload.featured = true
      }

      if (props.order) {
        payload.order = props.order
        payload.order === 'random' && delete payload.page
      }

      try {
        const response = await state.apiv2.releases.find(payload)

        if (response.status !== 'ok' || !Array.isArray(response.data)) {
          component.error = response
          return machine.emit('request:error')
        }

        if (!response.data.length) {
          return machine.emit('request:noResults')
        }

        machine.emit('request:resolve')

        if (!props.featured) {
          state.releases.items = response.data
          state.releases.count = response.count
          state.releases.pages = response.numberOfPages || 1
        } else {
          state.featuredReleases.items = response.data
        }

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

    emitter.on('releases:findOne', async (props) => {
      const cid = `release-${state.params.id}`

      state.cache(Playlist, cid)

      const component = state.components[cid]
      const { machine, events } = component
      const loaderTimeout = LoaderTimeout(events)

      machine.emit('start')

      try {
        const response = await state.apiv2.releases.findOne({
          id: props.id
        })

        if (!response.data) {
          state.release.notFound = true
          state.release.loaded = true

          machine.emit('404')

          emitter.emit(state.events.RENDER)
        } else {
          state.release.data = response.data

          machine.emit('resolve')

          state.release.tracks = state.release.data.items.map((item) => {
            return {
              count: 0,
              favorite: false,
              track_group: [
                item
              ],
              track: item.track,
              url: item.track.url || `https://api.resonate.is/v1/stream/${item.track.id}`
            }
          })

          state.release.loaded = true

          emitter.emit(state.events.RENDER)

          setMeta()

          // apply favorites and play counts status
          if (state.user.uid) {
            let counts = {}
            let favorites = {}

            const ids = response.data.items.map(item => item.track.id)

            const { res1, res2 } = await hash({
              res1: state.apiv2.plays.resolve({ ids }),
              res2: state.apiv2.favorites.resolve({ ids })
            })

            counts = res1.data.reduce((o, item) => {
              o[item.track_id] = item.count
              return o
            }, {})

            favorites = res2.data.reduce((o, item) => {
              o[item.track_id] = item.track_id
              return o
            }, {})

            state.release.tracks = state.release.tracks.map((item) => {
              return Object.assign({}, item, {
                count: counts[item.track.id] || 0,
                favorite: !!favorites[item.track.id]
              })
            })
          }

          if (!state.tracks.length) {
            state.tracks = state.release.tracks
          }
        }
      } catch (err) {
        machine.emit('reject')
        emitter.emit('error', err)
      } finally {
        emitter.emit(state.events.RENDER)
        events.state.loader === 'on' && events.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
      }
    })

    emitter.on('route:releases', () => {
      setMeta()
      emitter.emit('releases:find', state.query)
    })

    emitter.on('route:discovery', () => {
      setMeta()
      emitter.emit('releases:find', { featured: true })
    })

    emitter.on('route:artist/:id/release/:slug', async () => {
      state.release.loaded = false
      state.release.notFound = false
      state.release = {
        data: {},
        tracks: []
      }
      emitter.emit(state.events.RENDER)

      try {
        const { href } = new URL(state.href, 'https://beta.stream.resonate.localhost')
        const response = await state.apiv2.resolve({
          url: href
        })

        if (response.data) {
          emitter.emit('releases:findOne', { id: response.data.id })
        }
      } catch (err) {
        emitter.emit('error', err)
      }
    })

    function setMeta () {
      const title = {
        releases: 'New releases',
        'u/:id/release/:slug': state.release.data.title || '...',
        'artist/:id/release/:slug': state.release.data.title || '...'
      }[state.route]

      if (!title) return

      state.shortTitle = title

      state.meta = {
        title: setTitle(title),
        'og:title': setTitle(title),
        'og:type': 'website',
        'og:url': 'https://beta.stream.resonate.coop' + state.href,
        'og:description': 'Browse new releases',
        'twitter:card': 'summary_large_image',
        'twitter:title': setTitle(title),
        'twitter:site': '@resonatecoop'
      }

      emitter.emit('meta', state.meta)
    }
  }
}

module.exports = releases
