const html = require('choo/html')
const Artists = require('../../components/profiles')
const Pagination = require('../../components/pagination')
const viewLayout = require('../../layouts/browse')
const { isNode } = require('browser-or-node')

module.exports = () => viewLayout(renderArtists)

function renderArtists (state, emit) {
  if (isNode) emit('prefetch:artists')

  return html`
    <section id="artists" class="flex flex-column flex-auto w-100 min-vh-100">
      ${state.cache(Artists, 'artists').render({
        items: state.artists.items
      })}
      ${renderPagination()}
    </section>
  `

  function renderPagination () {
    if (state.artists.numberOfPages <= 1) return

    return state.cache(Pagination, 'artists-pagination').render({
      page: Number(state.query.page) || 1,
      pages: state.artists.numberOfPages || 1
    })
  }
}
