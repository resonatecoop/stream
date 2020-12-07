/* global fetch */

const nanologger = require('nanologger')
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
        try {
          const { href } = new URL(state.href, 'https://beta.stream.resonate.localhost')
          let response = await (await fetch(`https://${process.env.API_DOMAIN}/v2/resolve?url=${href}`)).json()

          response = await state.apiv2.user.trackgroups.findOne({ id: response.data.id })

          state.playlist.data = response.data

          response = await state.apiv2.plays.resolve({ ids: response.data.items.map(item => item.track.id) })

          const counts = response.data.reduce((o, item) => {
            o[item.track_id] = item.count
            return o
          }, {})

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

          emitter.emit(state.events.RENDER)
        } catch (err) {
          emitter.emit('error', err)

          log.info(err)
        } finally {
          emitter.emit(state.events.RENDER)
        }
      })
    })
  }
}
