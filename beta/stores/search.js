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
      const playlistComponent = state.cache(Playlist, 'playlist-search')

      if (playlistComponent.machine.state === 'loading') return

      const q = state.params.q.toLowerCase()

      state.tracks = []

      state.search.results = {
        tracks: [],
        artists: [],
        labels: []
      }

      emitter.emit('render')

      state.search.q = q
      state.search.notFound = false

      const startLoader = () => {
        playlistComponent.events.emit('loader:on')
      }

      const loaderTimeout = setTimeout(startLoader, 1000)

      // emitter.emit('pushState', `/search/${state.search.q}/${state.params.tab || 'tracks'}`)

      playlistComponent.machine.emit('start')

      try {
        const { tracks, artists, labels } = await hash({
          tracks: state.api.tracks.search({ q: state.search.q }),
          artists: state.api.artists.search({ q: state.search.q }),
          labels: state.api.labels.search({ q: state.search.q })
        })

        if (tracks.data === null && artists.data === null && labels.data === null) {
          state.search.notFound = true
        }

        state.search.results = {
          artists: artists.data || [],
          labels: labels.data || [],
          tracks: tracks.data ? tracks.data.map(adapter) : []
        }

        emitter.emit(state.events.RENDER)

        playlistComponent.machine.emit('resolve')
        playlistComponent.events.state.loader === 'on' && playlistComponent.events.emit('loader:off')
      } catch (err) {
        playlistComponent.machine.emit('reject')
        log.info(err)
      } finally {
        clearTimeout(loaderTimeout)
      }
    }
  }
}
