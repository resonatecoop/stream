const html = require('choo/html')
const Header = require('../../components/header')
const FeaturedArtist = require('../../components/featured-artist')
const FeaturedLabel = require('../../components/featured-label')

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

const FEATURED_ARTISTS = [
  {
    creator_id: 13777,
    display_name: 'Tess Roby',
    cover: 'https://resonate.is/wp-content/uploads/ultimatemember/13777/profile_photo.jpg'
  },
  {
    creator_id: 431,
    display_name: 'Sky H1',
    coverOrientation: 'top',
    cover: 'https://resonate.is/wp-content/uploads/ultimatemember/431/profile_photo.jpg'
  },
  {
    creator_id: 3866,
    display_name: 'Marie Reiter',
    cover: 'https://resonate.is/wp-content/uploads/ultimatemember/3866/profile_photo.jpg?1605461741'
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
          data: FEATURED_ARTISTS[Math.floor(Math.random() * FEATURED_ARTISTS.length)]
        })}
        <main>
          ${view(state, emit)}
        </main>
        ${state.cache(FeaturedLabel, 'featured-label').render({
          data: FEATURED_LABELS[Math.floor(Math.random() * FEATURED_LABELS.length)]
        })}
      </div>
    `
  }
}
