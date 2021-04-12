const html = require('choo/html')
const Player = require('@resonate/player-component')
const Header = require('../components/header')
const {
  background: bg,
  text
} = require('@resonate/theme-skins')

module.exports = (view) => {
  return (state, emit) => {
    const player = state.cache(Player, 'player-footer').render({
      track: state.track.data.track,
      playlist: state.tracks,
      inIframe: true,
      hideCount: true,
      hideMenu: true,
      applicationHostname: process.env.APP_HOSTNAME,
      src: state.track.data.url,
      fav: 0,
      count: 0
    })
    const header = state.cache(Header, 'app-header').render({
      href: state.href
    })

    return html`
      <div id="app">
        ${header}
        <main>
          ${view(state, emit)}
        </main>
        <div class="${bg} ${text} shadow-contour fixed z-max bottom-0 right-0 left-0 w-100">
          ${player}
        </div>
      </div>
    `
  }
}
