const nanologger = require('nanologger')
const log = nanologger('store:artists')
const adapter = require('@resonate/schemas/adapters/v1/track')
const setTitle = require('../lib/title')
const Profiles = require('../components/profiles')
const Discography = require('../components/discography')
const Playlist = require('@resonate/playlist-component')
const setLoaderTimeout = require('../lib/loader-timeout')

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
        const response = await state.api.artists.find({
          page: pageNumber - 1,
          limit: 50,
          order: 'desc',
          order_by: 'id'
        })

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
        machine.state.loader === 'on' && machine.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
      }
    })

    emitter.on('route:artist/:id/releases', getArtist)
    emitter.on('route:artist/:id', getArtist)

    emitter.once('prefetch:artists', () => {
      if (!state.prefetch) return

      setMeta()

      state.artists = state.artists || {
        items: [],
        numberOfPages: 1
      }

      const pageNumber = state.query.page ? Number(state.query.page) : 1
      const request = state.api.artists.find({
        page: pageNumber - 1,
        limit: 20,
        order: 'desc',
        order_by: 'id'
      }).then(response => {
        if (response.data) {
          state.artists.items = response.data
          state.artists.numberOfPages = response.numberOfPages
        }

        emitter.emit(state.events.RENDER)
      }).catch(err => {
        emitter.emit('error', err)
      })

      state.prefetch.push(request)
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
        const response = await state.apiv2.artists.findOne({ id: id })

        if (!response.data) {
          state.artist.notFound = true
        } else {
          state.artist.data = response.data

          machine.emit('request:resolve')

          emitter.emit(state.events.RENDER)

          getArtistDiscography()
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
        let response = await state.apiv2.artists.getReleases({
          id: id,
          limit: 5,
          page: pageNumber
        })

        if (!response.data) {
          machine.emit('notFound')
        }

        if (response.data) {
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

          let counts = {}

          if (state.user.uid) {
            const ids = response.data.map((item) => {
              return item.items.map(({ track }) => track.id)
            }).flat(1)

            response = await state.apiv2.plays.resolve({
              ids: ids
            })

            counts = response.data.reduce((o, item) => {
              o[item.track_id] = item.count
              return o
            }, {})

            state.artist.discography.items = state.artist.discography.items.map((item) => {
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

          if (!state.tracks.length) {
            state.tracks = state.artist.discography.items[0].items
          }
        }

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

    /*

    async function getLatestRelease () {
      const id = Number(state.params.id)
      const response = await state.api.artists.getLatestRelease({ uid: id, limit: 1 })

      if (response.data) {
        state.artist.latestRelease.items = response.data

        emitter.emit(state.events.RENDER)
      }
    }

    */

    async function getTopTracks (limit = 10) {
      const id = Number(state.params.id)
      const cid = `top-tracks-artist-${id}`

      state.cache(Playlist, cid)

      const component = state.components[cid]
      const { machine, events } = component

      const loaderTimeout = setLoaderTimeout(events)

      try {
        machine.emit('start')

        let response = await state.apiv2.artists.getTopTracks({ id: id, limit: 3 })

        if (response.data) {
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

          let counts = {}

          if (state.user.uid) {
            const ids = response.data.map((item) => item.id)

            response = await state.apiv2.plays.resolve({
              ids: ids
            })

            counts = response.data.reduce((o, item) => {
              o[item.track_id] = item.count
              return o
            }, {})

            state.artist.topTracks.items = state.artist.topTracks.items.map((item) => {
              return Object.assign({}, item, {
                count: counts[item.track.id] || 0
              })
            })
          }

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
        events.state.loader === 'on' && events.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
      }
    }
  }
}
