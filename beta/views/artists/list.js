const html = require('choo/html')
const Artists = require('../../components/artists')

const viewLayout = require('../../elements/view-layout')

module.exports = ArtistsView

function ArtistsView (components) {
  return (state, emit) => {
    state.title = state.title || 'Artists'

    const artists = state.cache(Artists, 'artists').render({
      items: state.artists
    })

    return viewLayout((state, emit) => html`
      <section id="artists" class="bg-near-white black bg-black--dark white--dark bg-near-white--light black--light flex flex-column flex-auto w-100 pb6 ph3">
        ${artists}
      </section>
    `
    )(state, emit)
  }
}
