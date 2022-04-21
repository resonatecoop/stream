const { getAPIServiceClient } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST,
  base: process.env.API_BASE || '/api/v3'
})

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
        const request = new Promise((resolve, reject) => {
          (async () => {
            try {
              const client = await getAPIServiceClient('tag')
              const result = await client.getTag({ tag: state.query.term })

              return resolve(result.body)
            } catch (err) {
              return reject(err)
            }
          })()
        })

        state.prefetch.push(request)

        const response = await request

        state.tag.items = response.data
        state.tag.count = response.count
        state.tag.numberOfPages = response.numberOfPages

        emitter.emit(state.events.RENDER)
      } catch (err) {
        state.tag.notFound = err.status === 404
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
        const client = await getAPIServiceClient('tag')
        const result = await client.getTag({
          tag: state.query.term,
          page: state.query.page
        })

        const { body: response } = result
        const { data, count, numberOfPages: pages } = response

        state.tag.items = data
        state.tag.count = count
        state.tag.numberOfPages = pages
      } catch (err) {
        state.tag.notFound = err.status === 404
        emitter.emit('error', err)
      } finally {
        emitter.emit(state.events.RENDER)
      }
    })
  }
}
