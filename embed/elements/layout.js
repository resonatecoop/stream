const html = require('choo/html')
const Player = require('@resonate/player-component')
const Header = require('../components/header')
const {
  background: bg,
  foreground: fg,
  text
} = require('@resonate/theme-skins')

module.exports = (view) => {
  return (state, emit) => {
    const data = state.track ? state.track : {}
    const player = state.cache(Player, 'player-footer').render({
      track: data.track,
      playlist: state.tracks,
      src: data.url,
      fav: data.fav,
      count: data.count,
      setUrl: (url) => {
        return url
      }
    })
    const header = state.cache(Header, 'app-header').render({
      href: state.href
    })

    return html`
      <div id="app">
        ${header}
        <div class="sticky ${fg} ph3 pv1 z-5" style="top:var(--height-3)">
          <p class="lh-copy f4">
            You are previewing Resonate. <a href="https://resonate.is/join" target="_blank" rel="noopener">Join</a> now and earn free credits.
          </p>
        </div>
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
