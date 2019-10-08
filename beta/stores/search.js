const hash = require('promise-hash/lib/promise-hash')
const nanologger = require('nanologger')
const log = nanologger('search')
const adapter = require('@resonate/schemas/adapters/v1/track')
const Playlist = require('@resonate/playlist-component')
const Menu = require('../components/menu')

module.exports = search

/*
 * @description Store for search
 */

function search () {
  return (state, emitter) => {
    state.cache(Playlist, 'playlist-search')

    const menuComponent = state.cache(Menu, 'menu')

    if (!state.search) {
      state.search = {
        q: '',
        results: {
          tracks: [],
          artists: [],
          labels: []
        },
        visible: false,
        placeholder: 'search by name, artist, album, tag'
      }
    }

    emitter.on('DOMContentLoaded', () => {
      emitter.on('route:search/:q', search)
      emitter.on('route:search/:q/:tab', search)
      emitter.on('search', (q) => {
        emitter.emit(state.events.PUSHSTATE, `/search/${q}`)
      })

      emitter.on('search:close', () => {
        menuComponent.machine.emit('search:toggle')
      })
    })

    async function search () {
      const q = state.params.q.toLowerCase()
      const isNew = state.search.q !== q

      if (!isNew) {
        return emitter.emit(state.events.RENDER)
      }

      state.tracks = []

      state.search.results = {
        tracks: [],
        artists: [],
        labels: []
      }

      emitter.emit(state.events.RENDER)

      state.search.q = q

      const { machine, events } = state.components['playlist-search']

      const loaderTimeout = setTimeout(() => {
        events.emit('loader:on')
      }, 1000)

      const playlist = !['artists', 'labels'].includes(state.params.tab)

      if (playlist) {
        machine.emit('start')
      } else {
        clearTimeout(loaderTimeout)
      }

      try {
        const { tracks, artists, labels } = await hash({
          tracks: state.api.tracks.search({ q: state.search.q }),
          artists: state.api.artists.search({ q: state.search.q }),
          labels: state.api.labels.search({ q: state.search.q })
        })

        const notFound = tracks.data === null && artists.data === null && labels.data === null

        if (playlist && notFound) {
          return machine.emit('404')
        }

        state.search.results = {
          artists: artists.data || [],
          labels: labels.data || [],
          tracks: tracks.data ? tracks.data.map(adapter) : []
        }

        if (!state.tracks.length) {
          state.tracks = state.search.results.tracks
        }

        if (playlist) {
          machine.emit('resolve')

          if (events.state.loader === 'on') {
            return events.emit('loader:off')
          }
        }
      } catch (err) {
        emitter.emit('error', err)
        if (playlist) {
          machine.emit('reject')
        }
        log.info(err)
      } finally {
        emitter.emit(state.events.RENDER)
        clearTimeout(loaderTimeout)
      }
    }
  }
}
