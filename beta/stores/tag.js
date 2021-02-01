module.exports = tag

function tag () {
  return (state, emitter, app) => {
    state.tag = state.tag || {
      items: []
    }

    emitter.once('prefetch:tag', async () => {
      if (!state.prefetch) return

      state.tag.notFound = false
      state.tag.count = 0

      try {
        const request = state.apiv2.tag.query({
          tag: state.query.term,
          page: state.query.page || 1
        })

        state.prefetch.push(request)

        const response = await request

        if (response.data) {
          state.tag.items = response.data
          state.tag.count = response.count
          state.tag.numberOfPages = response.numberOfPages
        } else {
          state.tag.notFound = true
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        emitter.emit('error', err)
      }
    })

    emitter.on('route:tag', async () => {
      state.tag.notFound = false
      state.tag.count = 0

      if (state.tag.value !== state.query.term || state.tag.page !== state.query.page) {
        state.tag.items = []
        emitter.emit(state.events.RENDER)
      }

      state.tag.page = state.query.page
      state.tag.value = state.query.term

      try {
        const { data, count = 0, status, numberOfPages } = await state.apiv2.tag.query({
          tag: state.query.term,
          page: state.query.page || 1
        })

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
    })
  }
}
