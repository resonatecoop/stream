const html = require('choo/html')
const Player = require('@resonate/player-component')
const queryString = require('query-string')
const Header = require('../components/header')
const { background } = require('@resonate/theme-skins')

module.exports = Layout

/**
 * App layout
 */

function Layout (view) {
  return (state, emit) => {
    const header = state.cache(Header, 'header').render({
      user: state.user,
      href: state.href,
      resolved: state.resolved
    })

    const data = state.tracks.length ? state.tracks[0] : {}
    const player = state.cache(Player, 'player-footer').render({
      track: data.track,
      playlist: state.tracks,
      trackGroup: data.track_group,
      src: data.url,
      fav: data.fav,
      count: data.count,
      setUrl: (url) => {
        return state.api.clientId ? (url + '?' + queryString.stringify({ client_id: state.api.clientId })) : url
      }
    })

    return html`
      <div id="app">
        ${header}
        <main style="min-height:calc(100vh - var(--height-3))" class="${background} flex flex-row-reverse flex-auto relative">
          ${view()(state, emit)}
        </main>
        <div class="${background} shadow-contour fixed bottom-0 right-0 left-0 w-100 z-999">
          ${player}
        </div>
      </div>
    `
  }
}
