/* global fetch */

const nanologger = require('nanologger')
const Playlist = require('@resonate/playlist-component')
const log = nanologger('search')
const List = require('../components/trackgroups')

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
      data: {}
    }

    emitter.on('DOMContentLoaded', () => {
      emitter.on('playlist:add', async (props) => {
        const { playlist_id: trackGroupId, track_id: trackId, title } = props

        try {
          await state.apiv2.user.trackgroups.addItems({
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

        }
      })
      emitter.on('playlist:remove', async (props) => {
        const { playlist_id: trackGroupId, track_id: trackId, title } = props

        try {
          await state.apiv2.user.trackgroups.removeItems({
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

        }
      })
      emitter.on('route:u/:id/library/playlists', async () => {
        const id = 'playlists-' + state.params.id

        state.cache(List, id)

        const component = state.components[id]
        const { machine } = component

        if (machine.state.request === 'loading') {
          return
        }

        const loaderTimeout = setTimeout(() => {
          machine.emit('loader:toggle')
        }, 1000)

        machine.emit('request:start')

        try {
          const response = await state.apiv2.user.trackgroups.find({
            type: 'playlist',
            limit: 20
          })

          if (response.status !== 'ok' || !Array.isArray(response.data)) {
            component.error = response
            return machine.emit('request:error')
          }

          if (!response.data.length) {
            return machine.emit('request:noResults')
          }

          machine.state.loader === 'on' && machine.emit('loader:toggle')
          machine.emit('request:resolve')

          state.playlists.data = response.data

          emitter.emit(state.events.RENDER)
        } catch (err) {
          component.error = err
          machine.emit('request:reject')
          emitter.emit('error', err)
          log.error(err)
        } finally {
          clearTimeout(loaderTimeout)
        }
      })
      emitter.on('route:u/:id/playlist/:slug', async () => {
        const cid = `playlist-${state.params.id}`

        state.cache(Playlist, cid)

        const component = state.components[cid]

        const { machine, events } = component

        const loaderTimeout = setTimeout(() => {
          events.emit('loader:on')
        }, 300)

        machine.emit('start')

        try {
          const { href } = new URL(state.href, 'https://beta.stream.resonate.localhost')
          let response = await (await fetch(`https://${process.env.API_DOMAIN}/v2/resolve?url=${href}`)).json()

          response = await state.apiv2.user.trackgroups.findOne({ id: response.data.id })

          if (response.data) {
            state.playlist.data = response.data

            let counts = {}

            if (state.user.uid) {
              response = await state.apiv2.plays.resolve({ ids: response.data.items.map(item => item.track.id) })

              counts = response.data.reduce((o, item) => {
                o[item.track_id] = item.count
                return o
              }, {})
            }

            machine.emit('resolve')

            state.playlist.tracks = state.playlist.data.items.map((item) => {
              return {
                count: counts[item.track.id] || 0,
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

            if (!state.tracks.length) {
              state.tracks = state.playlist.tracks
            }
          } else {
            state.playlist.notFound = true

            machine.emit('404')
          }

          state.playlist.loaded = true

          emitter.emit(state.events.RENDER)
        } catch (err) {
          machine.emit('reject')
          emitter.emit('error', err)

          log.info(err)
        } finally {
          clearTimeout(loaderTimeout)
          emitter.emit(state.events.RENDER)
        }
      })
    })
  }
}
