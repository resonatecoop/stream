const html = require('choo/html')
const Header = require('../../components/header')
const icon = require('@resonate/icon-element')
const { background: bg } = require('@resonate/theme-skins')

module.exports = LayoutLibrary

/**
 * App layout
 */

const navLinks = [
  {
    href: '/favorites',
    name: 'Favorites',
    title: 'Favorited tracks'
  },
  {
    href: '/collection',
    name: 'Collection',
    title: 'Owned tracks'
  },
  {
    href: '/playlists',
    name: 'Playlists',
    title: 'Play history'
  },
  {
    href: '/history',
    name: 'History',
    title: 'Play history'
  }
]

function LayoutLibrary (view) {
  return (state, emit) => {
    const baseHref = `/u/${state.user.uid}-${state.user.nicename}/library`

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${state.cache(Header, 'header').render({
          credits: state.user ? state.user.credits : 0,
          user: state.user,
          href: state.href,
          resolved: state.resolved
        })}
        <main class="flex flex-row flex-auto w-100 pb6">
          <nav role="navigation" aria-label="Browse navigation" class="dn db-l">
            <ul class="sticky list menu ma0 pa0 flex flex-column justify-around sticky z-999" style="top:3rem">
              ${navLinks.map(linkItem => {
                const { name, title, href } = linkItem
                const attrs = {
                  class: 'link b near-black near-black--light gray--dark db dim pv2 ph4 w-100',
                  title: title,
                  href: baseHref + href
                }
                return html`
                  <li class="relative flex justify-center w-100${state.href.includes(href) ? ' active' : ''}">
                    <a ${attrs}>${name}</a>
                  </li>
                `
              })}
            </ul>
          </nav>
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
