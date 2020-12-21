/* global fetch */

module.exports = tag

function tag () {
  return (state, emitter) => {
    state.tag = state.tag || {
      items: []
    }

    emitter.on('DOMContentLoaded', () => {
      emitter.on('route:tag/:tag', search)
      emitter.on('route:tag/:tag/:kind', search)
    })

    async function search () {
      if (state.tag.value !== state.params.tag) {
        state.tag.items = []

        emitter.emit(state.events.RENDER)
      }

      state.tag.value = state.params.tag
      state.tag.items = []

      emitter.emit(state.events.RENDER)

      try {
        const url = new URL(`/v2/tag/${state.params.tag}`, 'https://' + process.env.API_DOMAIN)
        url.search = new URLSearchParams({
          page: state.query.page || 1
        })
        const { data, status, numberOfPages } = await (await fetch(url.href)).json()

        if (data !== null && data.length >= 1) {
          state.tag.items = data
          state.tag.numberOfPages = numberOfPages
        } else if (status === 404) {
          state.tag.nodeFound = true
        }
      } catch (err) {
        emitter.emit('error', err)
      } finally {
        emitter.emit(state.events.RENDER)
      }
    }
  }
}
