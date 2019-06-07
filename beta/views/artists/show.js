const raw = require('choo/html/raw')
const html = require('choo/html')
const Albums = require('../../components/albums')
const Playlist = require('@resonate/playlist-component')
const ProfileHeader = require('../../components/profile-header')
const ProfileHeaderImage = require('../../components/profile-header-image')
const Label = require('../../components/label')
const Links = require('../../components/links')
const { foreground } = require('@resonate/theme-skins')

const viewLayout = require('../../elements/view-layout')

module.exports = ArtistView

function ArtistView () {
  return (state, emit) => {
    state.title = state.title || 'Artists'

    const id = parseInt(state.params.uid, 10)
    if (isNaN(id)) return emit(state.events.PUSHSTATE, '/')

    return viewLayout((state, emit) => html`
      <section id="artist-profile" class="flex flex-column flex-auto w-100">
        ${renderHeader(state)}
        <section id="content" class="flex flex-column flex-auto w-100 pb6 ph3">
          ${state.artist.topTracks.length ? renderTopTracks(state) : ''}
          ${!state.artist.topTracks.length && state.artist.tracks.length ? renderTracks() : ''}
          ${state.artist.albums.length ? renderAlbums(state) : ''}
          ${state.artist.data.description ? renderBio(state) : ''}
          ${state.artist.data.label ? renderMemberOf(state) : ''}
        </section>
      </section>
    `)(state, emit)

    function renderHeader (state) {
      const id = parseInt(state.params.uid, 10)
      const image = state.artist.data.avatar || {}
      const cover = image['cover']
      const profileHeaderImage = state.cache(ProfileHeaderImage, `profile-header-image-${id}`)
      const profileHeader = state.cache(ProfileHeader, `profile-header-${id}`).render({
        data: state.artist.data
      })
      return html`
        <section id="artist-header" class="w-100">
          ${cover ? profileHeaderImage.render({ cover }) : ''}
          ${profileHeader}
        </section>
      `
    }

    function renderTracks () {
      const id = parseInt(state.params.uid, 10)
      const playlist = state.cache(Playlist, `playlist-artist-${id}`).render({
        type: 'tracks',
        playlist: state.artist.tracks || []
      })
      return html`
        <section id="artist-playlist" class="flex-auto">
          <h2 class="lh-title">Tracks</h2>
          ${playlist}
          <div class="flex justify-center">
            <a class="${foreground} pa2 link b f5 grow dim" href="/artists/${id}/tracks">See all tracks</a>
          </div>
        </section>
      `
    }

    function renderTopTracks (state) {
      const id = parseInt(state.params.uid, 10)
      const playlist = state.cache(Playlist, `playlist-artist-top-${id}`).render({
        type: 'tracks',
        playlist: state.artist.topTracks || []
      })
      return html`
        <section id="artist-playlist" class="flex-auto">
          <h2 class="lh-title">Top tracks</h2>
          ${playlist}
          <div class="flex justify-center">
            <a class="${foreground} pa2 link b f5 grow dim" href="/artists/${id}/tracks">See all tracks</a>
          </div>
        </section>
      `
    }

    function renderAlbums (state) {
      const id = parseInt(state.params.uid, 10)
      const albums = state.cache(Albums, 'artist-albums-' + id).render({
        items: state.artist.albums || [],
        pagination: false,
        limit: 5
      })
      return html`
        <section id="artist-albums" class="flex-auto">
          <h2 class="lh-title">Albums</h2>
          ${albums}
          <div class="flex justify-center">
            <a class="${foreground} pa2 link b f5 grow dim" href="/artists/${id}/albums">See all albums</a>
          </div>
        </section>
      `
    }

    function renderBio (state) {
      const { description: body } = state.artist.data

      return html`
        <section id="bio" class="flex-auto mh3">
          <h4 class="f4">Bio</h4>
          <div class="flex flex-column flex-row-ns">
            <article class="w-100 mw6">
              ${raw(body)}
            </article>
            <aside id="links" class="ml4-ns">
              ${state.cache(Links, `links-${id}`).render({ uid: id })}
            </aside>
          </div>
        </section>
      `
    }

    function renderMemberOf (state) {
      const label = state.artist.data.label || {}
      const labels = [label].map(({ display_name: name, avatar, id }, index) => state.cache(Label, `label-${index}`)
        .render({
          id,
          avatar,
          name,
          context: 'profile'
        })
      )

      return html`
        <section id="members" class="flex-auto mh3">
          <h4 class="f4">Members of</h4>
          <ul class="list ma0 pa0 ttc flex flex-column">${labels}</ul>
        </section>
      `
    }
  }
}
