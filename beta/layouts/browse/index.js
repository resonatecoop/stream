const html = require('choo/html')
const Header = require('../../components/header')
const icon = require('@resonate/icon-element')
const { background: bg } = require('@resonate/theme-skins')

module.exports = LayoutBrowse

/**
 * App layout
 */

function LayoutBrowse (view) {
  return (state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
        ${state.cache(Header, 'header').render({
          credits: state.user ? state.user.credits : 0,
          user: state.user,
          href: state.href,
          resolved: state.resolved
        })}
        <main class="flex flex-row flex-auto w-100 pb6">
          <div class="dn db-l sticky top-0 z-999">
            <nav role="navigation" aria-label="Browse navigation" class="sticky z-999" style="top:3rem">
              <ul class="list menu ma0 pa0 flex flex-column justify-around">
                <li class="relative flex justify-center w-100${state.href === '/artists' ? ' active' : ''}">
                  <a class="link b near-black near-black--light gray--dark db dim pv2 ph4 w-100" href="/artists">Artists</a>
                </li>
                <li class="relative flex justify-center w-100${state.href === '/labels' ? ' active' : ''}">
                  <a class="link b near-black near-black--light gray--dark db dim pv2 ph4 w-100" href="/labels">Labels</a>
                </li>
              </ul>
            </nav>
          </div>
          <div class="flex flex-column flex-auto">
            <div class="sticky dn-l z-999 bg-near-black top-0 top-3-l">
              <button class="${bg} br1 bn w2 h2 ma2" onclick=${() => window.history.go(-1)}>
                <div class="flex items-center justify-center">
                  ${icon('arrow', { size: 'sm' })}
                </div>
              </button>
            </div>
            ${view(state, emit)}
          </div>
        </main>
      </div>
    `
  }
}
