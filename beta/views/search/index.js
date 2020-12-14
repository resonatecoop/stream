const html = require('choo/html')
const viewLayout = require('../../layouts/search')
const imagePlaceholder = require('../../lib/image-placeholder')
const card = require('../../components/profiles/card')

module.exports = SearchView

function SearchView () {
  return viewLayout((state, emit) => {
    const kinds = [...new Set(state.search.results.map(({ kind }) => kind))]
    const profile = baseHref => {
      return ({ name, user_id: id, images = {} }) => {
        const src = images['profile_photo-m'] || images['profile_photo-l'] || imagePlaceholder(400, 400)
        return card(baseHref + '/' + id, src, name)
      }
    }

    const result = {
      artist: profile('/artist'),
      label: profile('/label'),
      band: profile('/artist'),
      album: ({ name, display_artist: artist, images = {}, creator_id: id, title, slug }) => {
        const src = images.medium.url || imagePlaceholder(400, 400)
        return card(`/artist/${id}/album/${slug}`, src, html`
          <span class="lh-copy truncate fw4">${title}</span>
          <span class="f5 dark-gray lh-copy">By ${artist}</span>
        `)
      },
      track: ({ title, cover, track_id: id }) => {
        return card(`/track/${id}`, cover, title)
      }
    }

    state.search.results = kinds.includes(state.params.kind)
      ? state.search.results.filter(({ kind }) => kind === state.params.kind)
      : state.search.results

    // if search is on add padding?
    return html`
      <div class="flex flex-auto flex-column min-vh-100">
        <ul class="list ma0 pa0 cf mt5 mt0-l">
          ${state.search.results.map(item => result[item.kind](item))}
        </ul>
      </div>
    `
  })
}
