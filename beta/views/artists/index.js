const html = require('choo/html')
const Artists = require('../../components/artists')
const Pagination = require('../../components/pagination')
const subView = require('../../layouts/browse')

module.exports = ArtistsView

function ArtistsView () {
  return subView((state, emit) => {
    return html`
      <section id="artists" class="flex flex-column flex-auto w-100 pb6">
        ${state.cache(Artists, 'artists').render({
          items: state.artists.items
        })}
        ${state.cache(Pagination, 'artists-pagination').render({
          page: Number(state.query.page) || 1,
          pages: state.artists.numberOfPages || 1
        })}
      </section>
    `
  })
}
