const html = require('choo/html')
const Artists = require('../../components/profiles')
const Pagination = require('../../components/pagination')
const subView = require('../../layouts/browse')

module.exports = ArtistsView

function ArtistsView () {
  return subView((state, emit) => {
    return html`
      <section id="artists" class="flex flex-column flex-auto w-100 pb6 min-vh-100">
        ${state.cache(Artists, 'artists').render({
          items: state.artists.items
        })}
        ${state.artists.numberOfPages > 1 ? state.cache(Pagination, 'artists-pagination').render({
          page: Number(state.query.page) || 1,
          pages: state.artists.numberOfPages || 1
        }) : ''}
      </section>
    `
  })
}
