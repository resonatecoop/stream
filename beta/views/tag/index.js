const html = require('choo/html')
const viewLayout = require('../../layouts/search')
const imagePlaceholder = require('../../lib/image-placeholder')
const card = require('../../components/profiles/card')
const Pagination = require('../../components/pagination')

module.exports = TagView

function TagView () {
  return viewLayout((state, emit) => {
    const result = {
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

    state.tag.items = ['album', 'track'].includes(state.params.kind)
      ? state.tag.items.filter(({ kind }) => kind === state.params.kind)
      : state.tag.items

    return html`
      <div class="flex flex-auto flex-column min-vh-100">
        <ul class="list ma0 pa0">
          ${state.tag.items.map((item) => result[item.kind](item))}
        </ul>
        ${state.cache(Pagination, 'tag-pagination').render({
          page: Number(state.query.page) || 1,
          pages: state.tag.numberOfPages || 1
        })}
      </div>
    `
  })
}
