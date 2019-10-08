const html = require('choo/html')
const Player = require('@resonate/player-component')
const queryString = require('query-string')
const Header = require('../components/header')
const MenuBottom = require('../components/menu-bottom')
const matchMedia = require('../lib/match-media')
const { background } = require('@resonate/theme-skins')

module.exports = Layout

/**
 * App layout
 */

function Layout (view) {
  return (state, emit) => {
    const header = state.cache(Header, 'header').render({
      credits: state.user ? state.user.credits : 0,
      user: state.user,
      href: state.href,
      resolved: state.resolved
    })

    return html`
      <div id="app">
        ${header}
        <main style="min-height:calc(100vh - var(--height-3))" class="${background} flex flex-row-reverse flex-auto relative">
          ${view()(state, emit)}
        </main>
        <div class="${background} shadow-contour fixed bottom-0 right-0 left-0 w-100 z-999">
          ${renderPlayer()}
          ${renderMenu()}
        </div>
      </div>
    `

    function renderMenu () {
      if (!matchMedia('lg')) {
        return state.cache(MenuBottom, 'menu-bottom').render({
          href: state.href
        })
      }
    }

    function renderPlayer () {
      if (!Array.isArray(state.tracks) || !state.tracks.length) {
        return
      }

      const data = state.tracks[0]

      return state.cache(Player, 'player-footer').render({
        track: data.track,
        playlist: state.tracks,
        trackGroup: data.track_group,
        src: data.url,
        fav: data.fav,
        count: data.count,
        setUrl: (url) => {
          return state.api.clientId ? (url + '?' + queryString.stringify({
            preview: !state.user.credits > 0,
            client_id: state.api.clientId
          })) : url
        }
      })
    }
  }
}
