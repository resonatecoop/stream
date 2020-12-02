/* global fetch */

module.exports = tag

function tag () {
  return (state, emitter) => {
    state.tag = state.tag || {
      items: []
    }

    emitter.on('route:tag/:tag', async () => {
      if (state.tag.value !== state.params.tag) {
        state.tag.items = []

        emitter.emit(state.events.RENDER)
      }

      state.tag.value = state.params.tag

      try {
        const { data, status } = await (await fetch('https://' + process.env.API_DOMAIN + `/v2/tag/${state.params.tag}`)).json()

        if (data !== null && data.length >= 1) {
          state.tag.items = data
        } else if (status === 404) {
          state.tag.nodeFound = true
        }
      } catch (err) {
        emitter.emit('error', err)
      } finally {
        emitter.emit(state.events.RENDER)
      }
    })
  }
}
