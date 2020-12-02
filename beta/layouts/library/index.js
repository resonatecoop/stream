const html = require('choo/html')
const Header = require('../../components/header')

module.exports = LayoutLibrary

/**
 * App layout
 */

const navLinks = [
  {
    href: '/picks',
    name: 'Picks',
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
          <div class="dn db-l sticky top-0 z-999">
            <nav role="navigation" aria-label="Library navigation" class="sticky z-999" style="top:3rem">
              <ul class="list ma0 pa0 flex flex-column justify-around">
                ${navLinks.map(linkItem => {
                  const { name, title, href } = linkItem
                  const attrs = {
                    class: 'link b near-black near-black--light gray--dark db dim pv2 ph4 mr2 w-100',
                    title: title,
                    href: baseHref + href
                  }
                  return html`
                    <li>
                      <a ${attrs}>${name}</a>
                    </li>
                  `
                })}
              </ul>
            </nav>
          </div>
          ${view(state, emit)}
        </main>
      </div>
    `
  }
}
