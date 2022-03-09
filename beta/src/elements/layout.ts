import Player from '@resonate/player-component'
import Header from '../components/header'
import Footer from '../components/footer'
import { background } from '@resonate/theme-skins'
import { View } from '../views/main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

/**
 * App layout
 */
function Layout (view: () => View): View {
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

    function renderPlayer (): HTMLElement | undefined {
      if (!Array.isArray(state.tracks) || !state.tracks.length) {
        return
      }

      const data = state.tracks[0]

      return html`
        <div class="${background} fixed bottom-3 bottom-0-l right-0 left-0 w-100 z-999 shadow-contour">
          ${state.cache(Player, 'player-footer').render({
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

export default Layout
