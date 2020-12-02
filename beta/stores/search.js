/* global fetch */

const nanologger = require('nanologger')
const log = nanologger('search')

module.exports = search

/*
 * @description Store for search
 */

function search () {
  return (state, emitter) => {
    state.search = state.search || {
      q: '',
      results: [],
      placeholder: 'search by name, artist, album, tag'
    }

    emitter.on('DOMContentLoaded', () => {
      emitter.on('route:search/:q', search)
      emitter.on('route:search/:q/:kind', search)
      emitter.on('search', (q) => {
        emitter.emit(state.events.PUSHSTATE, `/search/${q}`)
      })
    })

    async function search () {
      try {
        const url = new URL('https://' + process.env.API_DOMAIN + '/v2/search')
        url.search = new URLSearchParams({ q: state.params.q })
        const { data, status } = await (await fetch(url.href)).json()

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
    }
  }
}
