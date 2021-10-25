const nanologger = require('nanologger')
const log = nanologger('search')
const { getAPIServiceClient } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST
})

module.exports = searchStore

/*
 * @description Store for search
 */

function searchStore () {
  return (state, emitter) => {
    state.search = state.search || {
      notFound: false,
      q: '',
      results: [],
      placeholder: 'search by name, artist, album, tag'
    }

    emitter.once('prefetch:search', async () => {
      if (!state.prefetch) return
      if (typeof state.query.q === 'undefined') return

      state.search = state.search || {
        notFound: false,
        q: '',
        results: [],
        placeholder: 'search by name, artist, album, tag'
      }

      try {
        const request = new Promise((resolve, reject) => {
          (async () => {
            try {
              const client = await getAPIServiceClient('search')
              const result = await client.getSearch({ q: state.query.q })

              return resolve(result.body)
            } catch (err) {
              return reject(err)
            }
          })()
        })

        state.prefetch.push(request)

        const response = await request

        if (response.data) {
          state.search.results = response.data
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        emitter.emit('error', err)
      }
    })

    emitter.on('route:search', async () => {
      if (state.search.value !== state.query.q || state.search.page !== state.query.page) {
        state.search.results = []
        emitter.emit(state.events.RENDER)
      }

      state.search.notFound = false
      state.search.page = state.query.page
      state.search.value = state.query.q

      try {
        const client = await getAPIServiceClient('search')
        const result = await client.getSearch({ q: state.query.q })
        const { body: response } = result

        state.search.results = response.data
      } catch (err) {
        state.search.notFound = err.status === 404
        emitter.emit('error', err)
        log.info(err)
      } finally {
        emitter.emit(state.events.RENDER)
      }
    })

    emitter.on('search', (q) => {
      if (q.startsWith('#')) {
        return emitter.emit(state.events.PUSHSTATE, `/tag?term=${q.split('#')[1]}`)
      }
      const url = new URL('/search', 'http://localhost')
      url.search = new URLSearchParams({ q })
      return emitter.emit(state.events.PUSHSTATE, url.pathname + url.search)
    })
  }
}
