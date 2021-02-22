const html = require('choo/html')
const FeaturedArtist = require('../../components/featured-artist')
const FeaturedLabel = require('../../components/featured-label')
const FeaturedPlaylist = require('../../components/featured-playlist')

const FEATURED_LABELS = [
  {
    creator_id: 10561,
    display_name: 'Beat Machine Records',
    cover: 'https://resonate.is/wp-content/uploads/ultimatemember/10561/cover_photo-500x156.png'
  }
]

module.exports = LayoutDiscovery

/**
 * App layout
 */

function LayoutDiscovery (view) {
  return (state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
        ${state.cache(FeaturedArtist, 'featured-artist').render({
          uid: state.user.uid
        })}
        <main>
          ${view(state, emit)}
        </main>
        ${state.cache(FeaturedLabel, 'featured-label').render({
          data: FEATURED_LABELS
        })}
        ${state.cache(FeaturedPlaylist, 'featured-playlist').render({
          uid: state.user.uid
        })}
      </div>
    `
  }
}
