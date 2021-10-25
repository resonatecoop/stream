const html = require('choo/html')
const Player = require('@resonate/player-component')
const Header = require('../components/header')
const Footer = require('../components/footer')
const { background } = require('@resonate/theme-skins')

module.exports = Layout

/**
 * App layout
 */

function Layout (view) {
  return (state, emit) => {
    return html`
      <div id="app">
        ${state.cache(Header, 'header').render({
          credits: state.credits,
          user: state.user,
          href: state.href,
          resolved: state.resolved
        })}
        ${view()(state, emit)}
        ${state.cache(Footer, 'footer').render()}
        ${renderPlayer()}
      </div>
    `

    function renderPlayer () {
      if (!Array.isArray(state.tracks) || !state.tracks.length) {
        return
      }

      const data = state.tracks[0]

      return html`
        <div class="${background} fixed bottom-3 bottom-0-l right-0 left-0 w-100 z-999 shadow-contour">
          ${state.cache(Player, 'player-footer').render({
            clientId: state.clientId,
            track: data.track,
            playlist: state.tracks,
            trackGroup: data.track_group,
            src: data.url,
            fav: data.fav,
            count: data.count
          })}
        </div>
      `
    }
  }
}
