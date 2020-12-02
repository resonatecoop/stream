const raw = require('choo/html/raw')
const html = require('choo/html')
const Albums = require('../../components/albums')
const Artists = require('../../components/artists')
const ProfileHeader = require('../../components/profile-header')
const ProfileHeaderImage = require('../../components/profile-header/image')
const icon = require('@resonate/icon-element')
const viewLayout = require('../../layouts/default')
const renderTotal = require('../../elements/total')
const { isNode } = require('browser-or-node')

module.exports = LabelView

function LabelView () {
  return (state, emit) => {
    if (isNode) emit('prefetch:label', state.params.id)

    return viewLayout((state, emit) => {
      return html`
        <section id="label-profile" class="flex flex-column flex-auto w-100">
          ${renderHeader(state)}
          ${renderContent(state)}
        </section>
      `
    })(state, emit)

    function renderHeader (state) {
      const profileHeader = state.cache(ProfileHeader, 'profile-header')

      return html`
        <section id="label-header" class="w-100">
          ${renderProfileHeaderImage(state)}
          ${profileHeader.render({
            name: state.label.data.name,
            country: state.label.data.country,
            images: state.label.data.images
          })}
        </section>
      `

      function renderProfileHeaderImage (state) {
        if (!state.label.data) return

        const id = Number(state.params.id)
        const profileHeaderImage = state.cache(ProfileHeaderImage, `profile-header-image-${id}`)

        return profileHeaderImage.render({
          name: state.label.data.name,
          images: state.label.data.images
        })
      }
    }

    function renderContent (state) {
      let placeholder
      let artists
      let albums
      let bio

      if (state.label.notFound) {
        placeholder = renderPlaceholder('Resource not found')
      } else {
        if (state.label.artists.items.length) {
          artists = renderArtists(state)
        }

        if (state.label.albums.items.length) {
          albums = renderAlbums(state)
        }

        if (state.label.data.id) {
          bio = renderBio(state)
        }
      }

      return html`
        <section id="content" class="flex flex-column flex-auto w-100 pb7">
          ${placeholder}
          ${artists}
          ${albums}
          ${bio}
        </section>
      `
    }

    function renderBio (state) {
      const { name, description: body, links = [] } = state.label.data

      console.log(links)

      return html`
        <section id="bio" class="flex-auto mh3">
          <h3 class="f4 fw3">Bio</h3>
          <div class="flex flex-column flex-row-ns">
            <article class="w-100 mw6">
              ${body ? raw(body) : html`<span class="dark-gray">${name} has not provided a biography yet.</span>`}
            </article>
            <aside id="links" class="ml4-ns">
              <ul class="list flex flex-column">
                ${links.map((link) => html`
                  <li>
                    <a href=${link} class="link lh-copy f5 pa2 mb2">${link}</a>
                  </li>
                `)}
              </ul>
            </aside>
          </div>
        </section>
      `
    }

    function renderPlaceholder (message) {
      return html`
        <div class="flex justify-center items-center mt3">
          ${icon('info', { class: 'icon icon--sm fill-current-color' })}
          <p class="lh-copy pl3">${message}</p>
        </div>
      `
    }

    function renderArtists (state) {
      const id = Number(state.params.id)
      const { items = [], count = 0 } = state.label.artists

      return html`
        <section id="label-artists" class="flex-auto">
          <div class="flex">
            <h3 class="lh-title fw3 relative ml3">
              Artists
              ${renderTotal(count)}
            </h3>
          </div>
          ${state.cache(Artists, 'label-artists-' + id).render({ items })}
        </section>
      `
    }

    function renderAlbums (state) {
      const { items = [], count } = state.label.albums
      const id = Number(state.params.id)
      const albums = state.cache(Albums, 'label-albums-' + id).render({ items })

      return html`
        <section id="label-albums" class="flex-auto mh3 mt4">
          <div class="flex">
            <h3 class="fw3 lh-title relative mb4">
              Discography
              ${renderTotal(count)}
            </h3>
          </div>
          ${albums}
        </section>
      `
    }
  }
}
