const raw = require('choo/html/raw')
const html = require('choo/html')
const icon = require('@resonate/icon-element')
const Albums = require('../../components/albums')
const ProfileHeader = require('../../components/profile-header')
const ProfileHeaderImage = require('../../components/profile-header/image')
const LabelItem = require('../../components/labels/item')
const viewLayout = require('../../layouts/default')
const renderTotal = require('../../elements/total')
const { isNode } = require('browser-or-node')

module.exports = ArtistView

function ArtistView () {
  return (state, emit) => {
    if (isNode) emit('prefetch:artist', state.params.id)

    return viewLayout((state, emit) => {
      return html`
        <section id="artist-profile" class="flex flex-column flex-auto w-100">
          ${renderHeader(state)}
          ${renderContent(state)}
        </section>
      `
    })(state, emit)

    function renderContent (state) {
      let placeholder
      let topTracks
      let tracks
      let latestRelease
      let albums
      let bio
      let memberOf

      if (state.artist.notFound) {
        placeholder = renderPlaceholder('Resource not found')
      } else if (state.artist.data.id) {
        albums = renderAlbums(state)
        bio = renderBio(state)

        if (state.artist.data.label) {
          memberOf = renderMemberOf(state)
        }
      }

      return html`
        <section id="content" class="flex flex-column flex-auto w-100 pb7 ph3">
          ${placeholder}
          <div class="flex flex-column" style=${!state.artist.notFound ? 'min-height:100vh' : ''}>
            ${topTracks}
            ${tracks}
            ${latestRelease}
            ${albums}
          </div>
          ${bio}
          ${memberOf}
        </section>
      `
    }

    function renderHeader (state) {
      const profileHeader = state.cache(ProfileHeader, 'profile-header')

      return html`
        <section id="artist-header" class="w-100">
          ${renderProfileHeaderImage(state)}
          ${profileHeader.render({
            name: state.artist.data.name,
            country: state.artist.data.country,
            images: state.artist.data.images
          })}
        </section>
      `

      function renderProfileHeaderImage (state) {
        const id = Number(state.params.id)

        if (!state.artist.data.images) return

        if (!state.artist.data.images.cover_photo) return

        const profileHeaderImage = state.cache(ProfileHeaderImage, `profile-header-image-${id}`)

        return profileHeaderImage.render({
          name: state.artist.data.name,
          country: state.artist.data.country,
          images: state.artist.data.images
        })
      }
    }

    function renderPlaceholder (message) {
      return html`
        <div class="flex justify-center items-center mt3">
          ${icon('info', { class: 'icon icon--sm fill-current-color' })}
          <p class="lh-copy pl3">${message}</p>
        </div>
      `
    }

    function renderAlbums (state) {
      const { items = [], numberOfPages = 1, count = 0 } = state.artist.albums
      const id = Number(state.params.id)
      const albums = state.cache(Albums, 'artist-albums-' + id)

      return html`
        <section id="artist-albums" class="flex-auto">
          <div class="flex">
            <h3 class="fw3 relative lh-title">
              Discography
              ${renderTotal(count)}
            </h3>
          </div>
          <div>
            ${albums.render({
              name: state.artist.data.name,
              items,
              numberOfPages: numberOfPages,
              pagination: numberOfPages > 1
            })}
          </div>
        </section>
      `
    }

    function renderBio (state) {
      const { name, bio, links = [] } = state.artist.data

      return html`
        <section id="bio" class="flex-auto">
          <h3 class="fw3 f4 lh-title">Bio</h3>
          <div class="flex flex-column flex-row-ns">
            <article class="w-100 mb4 mw6">
              ${bio ? raw(bio) : html`<span class="dark-gray">${name} has not provided a biography yet.</span>`}
            </article>
            <aside id="links" class="ml4-ns">
              <ul class="list ma0 pa0 flex flex-column">
                ${links.map(({ href, text }) => html`
                  <li>
                    <a href=${href} rel="noreferer noopener" target="_blank" class="link db lh-copy mb2">${text}</a>
                  </li>
                `)}
              </ul>
            </aside>
          </div>
        </section>
      `
    }

    function renderMemberOf (state) {
      const id = Number(state.params.id.split('-')[0])
      const label = state.artist.data.label

      return html`
        <section id="members" class="flex-auto">
          <h3 class="fw3 f4 lh-title">Member of</h3>

          <div class="mw5">
            ${state.cache(LabelItem, `labels-${id}`, state, emit).render(label)}
          </div>
        </section>
      `
    }
  }
}
