const nanologger = require('nanologger')
const log = nanologger('store:artists')
const setTitle = require('../lib/title')
const Profiles = require('../components/profiles')
const Discography = require('../components/discography')
const Playlist = require('@resonate/playlist-component')
const setLoaderTimeout = require('../lib/loader-timeout')
const resolvePlaysAndFavorites = require('../lib/resolve-plays-favorites')
const { getAPIServiceClient } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST
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
      discography: {
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
        const client = await getAPIServiceClient('artists')
        const request = client.getArtist({ id: id })

        state.prefetch.push(request)

        const result = await request
        const { data } = result.body

        state.artist.data = data

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
        discography: {
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

      const loaderTimeout = setLoaderTimeout(machine)
      const pageNumber = state.query.page ? Number(state.query.page) : 1

      machine.emit('request:start')

      try {
        const client = await getAPIServiceClient('artists')

        // get latest updated artists from v2 api
        const result = await client.getArtists({
          page: pageNumber,
          limit: 50,
          order: 'desc',
          orderBy: 'id'
        })

        const { body: response } = result
        const { data, pages } = response

        state.artists.items = data
        state.artists.numberOfPages = pages

        machine.emit('request:resolve')

        emitter.emit(state.events.RENDER)
      } catch (err) {
        state.artists.notFound = err.status === 404
        component.error = err
        machine.emit('request:reject')
        emitter.emit('error', err)
      } finally {
        machine.state.loader === 'on' && machine.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
      }
    })

    emitter.on('route:artist/:id/releases', getArtist)
    emitter.on('route:artist/:id', getArtist)

    emitter.once('prefetch:artists', async () => {
      if (!state.prefetch) return

      setMeta()

      state.artists = state.artists || {
        items: [],
        numberOfPages: 1
      }

      const pageNumber = state.query.page ? Number(state.query.page) : 1

      try {
        const request = new Promise((resolve, reject) => {
          (async () => {
            try {
              const client = await getAPIServiceClient('artists')

              // get latest updated artists from v2 api
              const result = await client.getArtists({
                page: pageNumber,
                limit: 50,
                order: 'desc',
                orderBy: 'id'
              })

              return resolve(result.body)
            } catch (err) {
              return reject(err)
            }
          })()
        })

        state.prefetch.push(request)

        const response = await request

        state.artists.items = response.data
        state.artists.numberOfPages = response.pages
      } catch (err) {
        emitter.emit('error', err)
      } finally {
        emitter.emit(state.events.RENDER)
      }
    })

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
        const client = await getAPIServiceClient('artists')
        // get latest updated artists from v2 api
        const result = await client.getArtist({
          id: id
        })

        const { body: response } = result

        state.artist.data = response.data

        machine.emit('request:resolve')

        emitter.emit(state.events.RENDER)

        getArtistDiscography()
        getTopTracks()
      } catch (err) {
        state.artist.notFound = err.status === 404
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
        'artist/:id/releases': name,
        'artist/:id/releases/:slug': name
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

    async function getArtistDiscography () {
      const id = Number(state.params.id)

      state.cache(Discography, 'artist-discography-' + id)

      const { events, machine } = state.components['artist-discography-' + id]

      const loaderTimeout = setLoaderTimeout(events)

      machine.emit('start')

      try {
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        const client = await getAPIServiceClient('artists')
        const result = await client.getArtistReleases({
          id: id,
          limit: 5,
          page: pageNumber
        })

        const { body: response } = result

        state.artist.discography.items = response.data.map((item) => {
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
        state.artist.discography.count = response.count
        state.artist.discography.numberOfPages = response.numberOfPages

        if (state.user.uid) {
          const ids = [...new Set(response.data.map((item) => {
            return item.items.map(({ track }) => track.id)
          }).flat(1))]

          const [counts, favorites] = await resolvePlaysAndFavorites(ids)(state)

          state.artist.discography.items = state.artist.discography.items.map((item) => {
            return Object.assign({}, item, {
              items: item.items.map((item) => {
                return Object.assign({}, item, {
                  count: counts[item.track.id] || 0,
                  favorite: !!favorites[item.track.id]
                })
              })
            })
          })
        }

        machine.emit('resolve')

        if (!state.tracks.length) {
          state.tracks = state.artist.discography.items[0].items
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        if (err.status === 404) {
          machine.emit('notFound')
        } else {
          log.error(err)
          // TODO set error on component
          machine.emit('reject')
        }
      } finally {
        events.state.loader === 'on' && events.emit('loader:toggle')
        setMeta()
        clearTimeout(await loaderTimeout)
      }
    }

    async function getTopTracks (limit = 10) {
      const id = Number(state.params.id)
      const cid = `top-tracks-artist-${id}`

      state.cache(Playlist, cid)

      const component = state.components[cid]
      const { machine, events } = component

      const loaderTimeout = setLoaderTimeout(events)

      try {
        machine.emit('start')

        const client = await getAPIServiceClient('artists')
        const result = await client.getArtistTopTracks({ id: id, limit: 3 })
        const { body: response } = result

        state.artist.topTracks.items = response.data.map((item) => {
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

        if (state.user.uid) {
          const ids = [...new Set(response.data.map((item) => item.id))]

          const [counts, favorites] = await resolvePlaysAndFavorites(ids)(state)

          state.artist.topTracks.items = state.artist.topTracks.items.map((item) => {
            return Object.assign({}, item, {
              count: counts[item.track.id] || 0,
              favorite: !!favorites[item.track.id]
            })
          })
        }

        if (!state.tracks.length) {
          state.tracks = state.artist.topTracks.items
        }

        machine.emit('resolve')

        emitter.emit(state.events.RENDER)
      } catch (err) {
        if (err.status === 404) {
          machine.emit('404')
        } else {
          log.error(err)
          machine.emit('reject')
        }
      } finally {
        events.state.loader === 'on' && events.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
      }
    }
  }
}
