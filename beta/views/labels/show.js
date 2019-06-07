const raw = require('choo/html/raw')
const html = require('choo/html')
const Albums = require('../../components/albums')
const Artists = require('../../components/artists')
const ProfileHeader = require('../../components/profile-header')
const ProfileHeaderImage = require('../../components/profile-header-image')
const socialLinks = require('../../elements/social-buttons')
const viewLayout = require('../../elements/view-layout')
const { foreground } = require('@resonate/theme-skins')

module.exports = LabelView

function LabelView () {
  return (state, emit) => {
    state.title = state.title || 'Labels'

    return viewLayout((state, emit) => {
      return html`
        <section id="label-profile" class="flex flex-column flex-auto w-100">
          ${renderHeader(state)}
          <section id="content" class="flex flex-column flex-auto w-100 pb6">
            ${state.label.artists.length ? renderArtists(state) : ''}
            ${state.label.albums.length ? renderAlbums(state) : ''}
            ${state.label.data.description ? renderBio(state) : ''}
          </section>
        </section>
      `
    })(state, emit)

    function renderHeader (state) {
      const id = parseInt(state.params.uid, 10)
      const profileHeader = state.cache(ProfileHeader, 'profile-header').render({
        data: state.label.data
      })

      const image = state.label.data.avatar || {}
      const profileHeaderImage = state.cache(ProfileHeaderImage, `profile-header-image-${id}`).render({
        cover: image['cover']
      })

      return html`
        <section id="label-header" class="w-100">
          ${profileHeaderImage}
          ${profileHeader}
        </section>
      `
    }

    function renderBio (state) {
      const { name, description: body, links = [] } = state.label.data

      return html`
        <section id="bio" class="flex-auto mh3">
          <h4 class="f4">Bio</h4>
          <div class="flex flex-column flex-row-ns">
            <article class="w-100 mw6">
              ${body ? raw(body) : html`<span class="dark-gray">${name} has not provided a biography yet.</span>`}
            </article>
            <aside id="links" class="ml3-ns mt2">
              ${socialLinks(links)}
            </aside>
          </div>
        </section>
      `
    }

    function renderArtists (state) {
      const id = parseInt(state.params.uid, 10)
      const artists = state.cache(Artists, 'label-artists-' + id).render({
        items: state.label.artists || [],
        shuffle: true,
        pagination: false
      })

      return html`
        <section id="label-artists" class="flex-auto">
          <h2 class="lh-title ml3">Artists</h2>
          ${artists}
          ${state.label.artists.length === 20 ? html`<div class="flex justify-center mt4">
            <a class="${foreground} pa2 link b f5 grow dim" href="/labels/${id}/artists">See all artists</a>
          </div>` : ''}
        </section>
      `
    }

    function renderAlbums (state) {
      const id = parseInt(state.params.uid, 10)
      const albums = state.cache(Albums, 'label-albums-' + id).render({
        items: state.label.albums || [],
        pagination: false,
        limit: 5
      })

      return html`
        <section id="label-albums" class="flex-auto mh3">
          <h2 class="lh-title">Albums</h2>
          ${albums}
          <div class="flex justify-center">
            <a class="${foreground} pa2 link b f5 grow dim" href="/labels/${id}/albums">See all albums</a>
          </div>
        </section>
      `
    }
  }
}
