const nanologger = require('nanologger')
// const Playlist = require('@resonate/playlist-component')
const List = require('../components/trackgroups')
const log = nanologger('store:users')

module.exports = users

function users () {
  return (state, emitter) => {
    state.u = state.u || {
      data: [],
      playlists: {
        items: [],
        numberOfPages: 1
      }
    }

    emitter.on('route:u/:id', async () => {
      const id = 'u-playlists-' + state.params.id

      state.cache(List, id)

      const component = state.components[id]
      const { machine } = component

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setTimeout(() => {
        machine.state.loader === 'off' && machine.emit('loader:toggle')
      }, 1000)

      machine.emit('request:start')

      try {
        let response = await state.apiv2.users.findOne({ id: state.params.id })

        if (!response.data) {
          state.u.notFound = true
        } else {
          state.u.data = response.data

          emitter.emit(state.events.RENDER)

          response = await state.apiv2.users.playlists.find({
            id: state.params.id
          })

          if (response.status !== 'ok' || !Array.isArray(response.data)) {
            component.error = response
            return machine.emit('request:error')
          }

          if (!response.data.length) {
            return machine.emit('request:noResults')
          }

          machine.emit('request:resolve')

          state.u.playlists.count = response.count
          state.u.playlists.numberOfPages = response.numberOfPages
          state.u.playlists.items = response.data
        }
      } catch (err) {
        component.error = err
        machine.emit('request:reject')
        emitter.emit('error', err)
        log.error(err)
      } finally {
        machine.state.loader === 'on' && machine.emit('loader:toggle')
        clearTimeout(loaderTimeout)
        emitter.emit(state.events.RENDER)
      }
    })
  }
}
