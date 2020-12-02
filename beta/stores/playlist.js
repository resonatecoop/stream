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

          response = await (await fetch(response.data.uri)).json()

          state.playlist.data = response.data

          state.playlist.tracks = state.playlist.data.items.map((item) => {
            return {
              count: 0,
              fav: 0,
              track_group: [
                item
              ],
              track: item.track,
              url: `https://api.resonate.is/v1/stream/${item.track.id}`
            }
          })

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
