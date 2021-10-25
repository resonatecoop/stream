const html = require('choo/html')
// const FeaturedArtist = require('../../components/featured-artist')
// const FeaturedLabel = require('../../components/featured-label')
const FeaturedPlaylist = require('../../components/featured-playlist')

module.exports = LayoutDiscovery

/**
 * App layout
 */

function LayoutDiscovery (view) {
  return (state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
        <main>
          ${view(state, emit)}
        </main>
        ${state.cache(FeaturedPlaylist, 'featured-playlist').render({
          uid: state.user.uid
        })}
      </div>
    `
  }
}
