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
      state.tag.notFound = false
      state.tag.count = 0

      if (state.tag.value !== state.params.tag || state.tag.page !== state.query.page) {
        state.tag.items = []
        emitter.emit(state.events.RENDER)
      }

      state.tag.page = state.query.page
      state.tag.value = state.params.tag

      try {
        const url = new URL(`/v2/tag/${state.params.tag}`, 'https://' + process.env.API_DOMAIN)
        url.search = new URLSearchParams({
          page: state.tag.page || 1
        })
        const { data, count = 0, status, numberOfPages } = await (await fetch(url.href)).json()

        if (data !== null && data.length >= 1) {
          state.tag.items = data
          state.tag.count = count
          state.tag.numberOfPages = numberOfPages
        } else if (status === 404) {
          state.tag.notFound = true
        }
      } catch (err) {
        emitter.emit('error', err)
      } finally {
        emitter.emit(state.events.RENDER)
      }
    }
  }
}
