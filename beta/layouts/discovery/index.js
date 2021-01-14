const html = require('choo/html')
const Header = require('../../components/header')
const FeaturedArtist = require('../../components/featured-artist')
const FeaturedLabel = require('../../components/featured-label')
const FeaturedPlaylist = require('../../components/featured-playlist')

const FEATURED_LABELS = [
  {
    creator_id: 501,
    display_name: 'Planet Mu Records',
    cover: 'https://resonate.is/wp-content/uploads/ultimatemember/501/cover_photo-600x187.jpg'
  },
  {
    creator_id: 7929,
    display_name: 'Hyperdub',
    cover: 'https://resonate.is/wp-content/uploads/ultimatemember/7929/cover_photo-600x188.jpeg'
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
        ${state.cache(Header, 'header').render({
          credits: state.user ? state.user.credits : 0,
          user: state.user,
          href: state.href,
          resolved: state.resolved
        })}
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
