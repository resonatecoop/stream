const List = require('../components/trackgroups')
const LoaderTimeout = require('../lib/loader-timeout')
const { getAPIServiceClient } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST
})

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

      const loaderTimeout = LoaderTimeout(machine)

      machine.emit('request:start')

      try {
        const client = await getAPIServiceClient('users')
        const result = await client.getUser({ id: state.params.id })
        const { body: response } = result
        const { status, data: userData } = response

        state.u.notFound = status === 404

        if (userData) {
          state.u.data = userData

          emitter.emit(state.events.RENDER)

          const result = await client.getUserPlaylists({ id: state.params.id })
          const { body: response } = result
          const { status, data: playlistData, count, numberOfPages: pages } = response

          if (status !== 'ok' || !Array.isArray(playlistData)) {
            component.error = response
            return machine.emit('request:error')
          }

          if (!playlistData.length) {
            return machine.emit('request:noResults')
          }

          machine.emit('request:resolve')

          state.u.playlists.count = count
          state.u.playlists.numberOfPages = pages
          state.u.playlists.items = playlistData
        }
      } catch (err) {
        component.error = err
        machine.emit('request:reject')
        emitter.emit('error', err)
      } finally {
        machine.state.loader === 'on' && machine.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
        emitter.emit(state.events.RENDER)
      }
    })
  }
}
