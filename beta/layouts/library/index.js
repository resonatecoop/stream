const html = require('choo/html')
const icon = require('@resonate/icon-element')
const { background: bg } = require('@resonate/theme-skins')

module.exports = LayoutLibrary

const items = [
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
    title: 'Your playlists'
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
      <main class="flex flex-column flex-auto pb6">
        <div class="sticky top-0 top-3-l fixed-l z-999 bg-near-black bg-transparent-l">
          <button class="${bg} br1 bn w2 h2 ma2 ma3-l" onclick=${() => emit('navigate:back')}>
            <div class="flex items-center justify-center">
              ${icon('arrow', { size: 'sm' })}
            </div>
          </button>
        </div>
        <div class="flex flex-row flex-auto w-100">
          <nav role="navigation" aria-label="Browse navigation" class="dn db-l ml5-l">
            <ul class="sticky list menu ma0 pa0 flex flex-column justify-around sticky z-999" style="top:3rem">
              ${items.map(({ name, title, href }) => {
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
          ${view(state, emit)}
        </div>
      </main>
    `
  }
}
