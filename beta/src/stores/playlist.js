const setTitle = require('../lib/title')
const Playlist = require('@resonate/playlist-component')
const List = require('../components/trackgroups')
const LoaderTimeout = require('../lib/loader-timeout')
const resolvePlaysAndFavorites = require('../lib/resolve-plays-favorites')
const { getAPIServiceClient, getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST,
  base: process.env.API_BASE || '/api/v3'
})

module.exports = playlist

/*
 * @description Store for user playlist
 */

function playlist () {
  return (state, emitter) => {
    state.playlist = state.playlist || {
      data: {}
    }

    state.playlists = state.playlists || {
      items: []
    }

    emitter.once('prefetch:playlist', async () => {
      if (!state.prefetch) return

      try {
        const request = new Promise((resolve, reject) => {
          (async () => {
            try {
              let client = await getAPIServiceClient('resolve')
              const { href } = new URL(state.href, `https://${process.env.APP_DOMAIN}`)
              let result = client.resolve({ url: href })
              const { body: response } = result

              client = await getAPIServiceClient('trackgroups')
              result = await client.getTrackgroup({ id: response.data.id })

              return resolve(result.body)
            } catch (err) {
              return reject(err)
            }
          })()
        })

        state.prefetch.push(request)

        const response = await request

        state.playlist.data = response.data

        setMeta()
      } catch (err) {
        emitter.emit('error', err)
      }
    })

    emitter.on('DOMContentLoaded', () => {
      emitter.on('playlist:add', async (props) => {
        const { playlist_id: trackGroupId, track_id: trackId, title } = props

        try {
          const getClient = getAPIServiceClientWithAuth(state.user.token)
          const client = await getClient('trackgroups')

          await client.addTrackgroupItems({
            id: trackGroupId,
            tracks: [
              {
                track_id: trackId
              }
            ]
          })

          emitter.emit('notify', {
            timeout: 5000,
            type: 'success',
            message: `Track added to ${title}.`
          })

          emitter.emit(state.events.RENDER)
        } catch (err) {
          emitter.emit('error', err)
        }
      })

      emitter.on('playlist:remove', async (props) => {
        const { playlist_id: trackGroupId, track_id: trackId, title } = props

        try {
          const getClient = getAPIServiceClientWithAuth(state.user.token)
          const client = await getClient('trackgroups')

          await client.removeTrackgroupItems({
            id: trackGroupId,
            tracks: [
              {
                track_id: trackId
              }
            ]
          })

          emitter.emit('notify', {
            timeout: 5000,
            type: 'success',
            message: `Track removed from ${title}.`
          })

          emitter.emit(state.events.RENDER)
        } catch (err) {
          emitter.emit('error', err)
        }
      })

      emitter.on('route:u/:id/library/playlists', async () => {
        const id = 'playlists-' + state.params.id

        setMeta()

        state.cache(List, id)

        const component = state.components[id]
        const { machine } = component

        if (machine.state.request === 'loading') {
          return
        }

        const loaderTimeout = LoaderTimeout(machine)

        machine.emit('request:start')

        try {
          const getClient = getAPIServiceClientWithAuth(state.user.token)
          const client = await getClient('trackgroups')
          const result = await client.getTrackgroups({
            type: 'playlist',
            limit: 20
          })

          const { body: response } = result

          machine.emit('request:resolve')
          state.playlists.items = response.data
          emitter.emit(state.events.RENDER)
        } catch (err) {
          if (err.status === 404) {
            machine.emit('request:noResults')
          } else {
            component.error = err
            machine.emit('request:reject')
            emitter.emit('error', err)
          }
        } finally {
          machine.state.loader === 'on' && machine.emit('loader:toggle')
          clearTimeout(await loaderTimeout)
        }
      })

      emitter.on('route:u/:id/playlist/:slug/edit', async () => {
        state.playlist.data = {}

        setMeta()

        emitter.emit(state.events.RENDER)

        try {
          let client = await getAPIServiceClient('resolve')
          const { href } = new URL(state.href, `https://${process.env.APP_DOMAIN}`)
          let result = await client.resolve({ url: href })
          const { body: resolveResponse } = result
          const { data } = resolveResponse

          const getClient = getAPIServiceClientWithAuth(state.user.token)
          client = await getClient('trackgroups')
          result = await client.getTrackgroup({ id: data.id })
          const { body: response } = result

          state.playlist.data = response.data
          setMeta()

          emitter.emit(state.events.RENDER)

          state.playlist.loaded = true
        } catch (err) {
          if (err.status === 404) {
            emitter.emit('redirect', {
              message: 'You are not authorized',
              dest: `/u/${state.params.id}/playlist/${state.params.slug}`
            })
          }

          emitter.emit('error', err)
        } finally {
          emitter.emit(state.events.RENDER)
        }
      })

      emitter.on('route:u/:id/playlist/:slug', async () => {
        state.playlist.data = {}

        setMeta()

        emitter.emit(state.events.RENDER)

        const cid = `playlist-${state.params.id}-${state.params.slug}`

        state.cache(Playlist, cid)

        const component = state.components[cid]
        const { machine, events } = component
        const loaderTimeout = LoaderTimeout(events)

        machine.emit('start')

        try {
          let client = await getAPIServiceClient('resolve')
          const { href } = new URL(state.href, `https://${process.env.APP_DOMAIN}`)
          let result = await client.resolve({ url: href })
          const { body: resolveResponse } = result
          const { data } = resolveResponse
          const { private: _private } = data
          const getClient = getAPIServiceClientWithAuth(state.user.token)

          client = _private ? await getClient('trackgroups') : await getAPIServiceClient('trackgroups')
          result = await client.getTrackgroup({ id: data.id })

          const { body: response } = result

          state.playlist.data = response.data

          setMeta()

          machine.emit('resolve')

          state.playlist.tracks = state.playlist.data.items.map((item) => {
            return {
              count: 0,
              favorite: false,
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

          state.playlist.loaded = true

          emitter.emit(state.events.RENDER)

          if (state.user.uid) {
            const ids = response.data.items.map(item => item.track.id)
            const [counts, favorites] = await resolvePlaysAndFavorites(ids)(state)

            state.playlist.tracks = state.playlist.tracks.map((item) => {
              return Object.assign({}, item, {
                count: counts[item.track.id] || 0,
                favorite: !!favorites[item.track.id]
              })
            })
          }

          if (!state.tracks.length) {
            state.tracks = state.playlist.tracks
          }
        } catch (err) {
          if (err.status === 404) {
            state.playlist.notFound = true
            machine.emit('404')
          } else {
            machine.emit('reject')
          }
          emitter.emit('error', err)
        } finally {
          emitter.emit(state.events.RENDER)
          events.state.loader === 'on' && events.emit('loader:toggle')
          clearTimeout(await loaderTimeout)
        }
      })
    })

    function setMeta () {
      const title = {
        'route:u/:id/library/playlists': 'Playlists',
        'route:u/:id/playlist/:slug/edit': 'Edit playlist',
        'u/:id/playlist/:slug': state.playlist.data.title || '...'
      }[state.route]

      if (!title) return

      emitter.emit('meta', {
        title: setTitle(title),
        'twitter:card': 'summary_large_image',
        'twitter:title': setTitle(title),
        'twitter:site': '@resonatecoop'
      })
    }
  }
}
