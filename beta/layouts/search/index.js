const html = require('choo/html')
const Header = require('../../components/header')
const icon = require('@resonate/icon-element')
const { background: bg } = require('@resonate/theme-skins')

module.exports = LayoutSearch

/**
 * App layout
 */

function LayoutSearch (view) {
  return (state, emit) => {
    const isSearch = state.route.split('/')[0] === 'search'
    const results = isSearch ? state.search.results : state.tag.items
    const kinds = [...new Set(results.map((item) => item.kind))] // get unique items
    const links = (state.route.split('/')[0] === 'search' ? [
      {
        kind: 'artist',
        text: 'Artists'
      },
      {
        kind: 'album',
        text: 'Albums'
      },
      {
        kind: 'track',
        text: 'Tracks'
      },
      {
        kind: 'label',
        text: 'Labels'
      }
    ] : [
      {
        kind: 'track',
        text: 'Tracks'
      },
      {
        kind: 'album',
        text: 'Albums'
      }
    ]).filter((item) => {
      return kinds.includes(item.kind)
    })
    const basehref = {
      'search/:q': `/search/${state.params.q}`,
      'search/:q/:kind': `/search/${state.params.q}`,
      'tag/:tag': `/tag/${state.params.tag}`,
      'tag/:tag/:kind': `/tag/${state.params.tag}`
    }[state.route]

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
              <ul class="list ma0 pa0 flex flex-column justify-around">
                <li>
                  <a class="link db dim pv2 ph4 mr2 w-100" href=${basehref}>All</a>
                </li>
                ${links.map(({ kind, text }) => html`
                  <li>
                    <a class="link db dim pv2 ph4 mr2 w-100" href="${basehref}/${kind}">${text}</a>
                  </li>
                `)}
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
