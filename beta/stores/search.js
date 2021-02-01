const nanologger = require('nanologger')
const log = nanologger('search')

module.exports = searchStore

/*
 * @description Store for search
 */

function searchStore () {
  return (state, emitter) => {
    state.search = state.search || {
      q: '',
      results: [],
      placeholder: 'search by name, artist, album, tag'
    }

    emitter.once('prefetch:search', async () => {
      if (!state.prefetch) return
      if (typeof state.query.q === 'undefined') return

      state.search = state.search || {
        q: '',
        results: [],
        placeholder: 'search by name, artist, album, tag'
      }

      try {
        const request = state.apiv2.search.query({ q: state.query.q })

        state.prefetch.push(request)

        const response = await request

        if (response.data) {
          state.search.results = response.data
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        console.log(err)
        emitter.emit('error', err)
      }
    })

    emitter.on('route:search', async () => {
      if (state.search.value !== state.query.q || state.search.page !== state.query.page) {
        state.search.results = []
        emitter.emit(state.events.RENDER)
      }

      state.search.page = state.query.page
      state.search.value = state.query.q

      try {
        const { data, status } = await state.apiv2.search.query({ q: state.query.q })

        if (data) {
          state.search.results = data
        }

        if (!data && status === 404) {
          state.search.notFound = true
        }
      } catch (err) {
        emitter.emit('error', err)
        log.info(err)
      } finally {
        emitter.emit(state.events.RENDER)
      }
    })

    emitter.on('search', (q) => {
      emitter.emit(state.events.PUSHSTATE, `/search?q=${q}`)
    })
  }
}
