const html = require('choo/html')
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
        text: 'All'
      },
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
        text: 'All'
      },
      {
        kind: 'track',
        text: 'Tracks'
      },
      {
        kind: 'album',
        text: 'Albums'
      }
    ]).filter((item) => {
      if (!item.kind) return true
      return kinds.includes(item.kind)
    })

    return html`
      <main class="flex flex-column flex-auto pb6">
        <div class="flex flex-column flex-row-l flex-auto w-100">
          <div class="flex flex-column sticky top-0 top-3-l z-999">
            <div class="sticky top-0 z-999 top-3-l z-999 bg-near-black bg-transparent-l">
              <button class="${bg} br1 bn w2 h2 ma2 ma3-l" onclick=${() => emit('navigate:back')}>
                <div class="flex items-center justify-center">
                  ${icon('arrow', { size: 'sm' })}
                </div>
              </button>
            </div>
          </div>
          <nav role="navigation" aria-label="Search navigation" class="dn db-l">
            <ul class="sticky list menu ma0 pa0 flex flex-column justify-around z-999" style="top:3rem">
              ${links.map(({ kind, text }) => {
                const url = new URL(state.href, 'http://localhost')

                url.search = new URLSearchParams(
                  Object.fromEntries(Object.entries(Object.assign({}, state.query, { kind })).filter(([_, v]) => Boolean(v)))
                )

                const href = url.pathname + url.search

                return html`
                  <li class="relative flex justify-center w-100${state.query.kind === kind ? ' active' : ''}">
                    <a class="link db dim pv2 ph4 mr2 w-100" href="${href}">${text}</a>
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
