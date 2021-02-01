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
      <main class="flex flex-row flex-auto w-100">
        <nav role="navigation" aria-label="Browse navigation" class="dn db-l">
          <ul class="sticky list menu ma0 pa0 flex flex-column justify-around sticky z-999" style="top:3rem">
            ${links.map(({ kind, text }) => {
              const url = new URL(state.href, 'http://localhost')

              url.search = new URLSearchParams(
                Object.fromEntries(Object.entries(Object.assign({}, state.query, { kind })).filter(([_, v]) => Boolean(v)))
              )

              return html`
                <li>
                  <a class="link db dim pv2 ph4 mr2 w-100" href="${url.pathname + url.search}">${text}</a>
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
    `
  }
}
