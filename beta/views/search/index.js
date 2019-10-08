const html = require('choo/html')
const matchMedia = require('../../lib/match-media')
const Playlist = require('@resonate/playlist-component')
const Artists = require('../../components/artists')
const Labels = require('../../components/labels')
const viewLayout = require('../../elements/view-layout')
const { background: bg, borders: borderColors } = require('@resonate/theme-skins')
const icon = require('@resonate/icon-element')

module.exports = SearchView

function SearchView () {
  return (state, emit) => {
    const { machine } = state.components['playlist-search']

    const results = Object.entries(state.search.results)
      .filter(([key, value]) => {
        if (!value) return false
        if (value.length) return true
      }).map(([key, value]) => ({
        key,
        data: state.search.results[key],
        count: state.search.results[key].length
      }))

    const defaultTab = state.search.results.tracks.length ? 'tracks' : state.search.results.labels.length ? 'labels' : 'artists'

    const tabView = {
      artists: () => {
        const artists = new Artists('artists-search', state, emit)
        return artists.render({
          items: state.search.results.artists,
          pagination: false
        })
      },
      labels: () => {
        const labels = new Labels('labels-search', state, emit)
        return labels.render({
          items: state.search.results.labels
        })
      },
      tracks: () => {
        return state.cache(Playlist, 'playlist-search').render({
          playlist: state.search.results.tracks
        })
      }
    }[state.params.tab || defaultTab]

    const view = {
      404: renderPlaceholder('No results found'),
      error: renderPlaceholder('Failed to fetch search results')
    }[machine.state] || tabView()

    return viewLayout((state, emit) => html`
      <div class="flex flex-column w-100 pb6">
        <div class="sticky-ns z-4" style="top:${matchMedia('lg') ? 'calc(var(--height-3) * 2)' : 0};">
          ${tabNavigation({ items: results })}
        </div>
        <section class="flex flex-column flex-auto w-100 ph3">
          ${view}
        </section>
      </div>
    `
    )(state, emit)

    function tabNavigation (props) {
      const { items: tabs } = props

      if (!tabs.length) return

      return html`
        <ul class="menu ${bg} h3 bb bw ${borderColors} flex w-100 list ma0 pa0">
          ${tabs.map(({ key: name, count }, index) => {
        return html`
              <li class="relative flex flex-auto ${state.href.includes(name) ? 'active' : ''}">
                <a href="/search/${state.params.q}/${name}" class="link flex items-center justify-center ttc color-inherit w-100 h-100 pv0 ph3 no-underline" title="${count} ${name} results">${name}</a>
              </li>
            `
      })}
        </ul>
      `
    }

    function renderPlaceholder (message) {
      return html`
        <div class="flex justify-center items-center mt3">
          ${icon('info', { class: 'icon icon--sm fill-current-color' })}
          <p class="lh-copy pl3">${message}</p>
        </div>
      `
    }
  }
}
