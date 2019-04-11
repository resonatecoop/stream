const raw = require('choo/html/raw')
const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const ProfileHeader = require('../../components/profile-header')
const ProfileHeaderImage = require('../../components/profile-header-image')
const Label = require('../../components/label')
const socialLinks = require('../../elements/social-buttons')

const viewLayout = require('../../elements/view-layout')

module.exports = ArtistView

function ArtistView () {
  return (state, emit) => {
    state.title = state.title || 'Artists'

    const id = parseInt(state.params.uid, 10)
    if (isNaN(id)) return emit(state.events.PUSHSTATE, '/')

    const playlist = state.cache(Playlist, `playlist-artist-${id}`).render({
      type: 'tracks',
      playlist: state.artist.tracks || []
    })

    const image = state.artist.data.avatar || {}
    const cover = image['cover']
    const profileHeaderImage = state.cache(ProfileHeaderImage, `profile-header-image-${id}`)
    const profileHeader = state.cache(ProfileHeader, `profile-header-${id}`).render({
      data: state.artist.data
    })

    const { name, description: body, links = [] } = state.artist.data

    const label = state.artist.data.label || {}
    const labels = [label].map(({ display_name: name, avatar, id }, index) => state.cache(Label, `label-${index}`)
      .render({
        id,
        avatar,
        name,
        context: 'profile'
      })
    )

    return viewLayout((state, emit) => html`
      <section id="artist-profile" class="flex flex-column flex-auto w-100">
        <section id="artist-header" class="w-100">
          ${cover ? profileHeaderImage.render({ cover }) : ''}
          ${profileHeader}
        </section>
        <section id="content" class="flex flex-column flex-auto w-100 pb6">
          <section id="artist-playlist">
            ${playlist}
          </section>
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
          <section id="members" class="flex-auto mh3">
            <h4 class="f4">Members of</h4>

            ${label.id ? html`<ul class="list ma0 pa0 ttc flex flex-column">
              ${labels}
            </ul>` : html`<span class="dark-gray">No labels associated with ${name}.</span>`}
          </section>
        </section>
      </section>
    `)(state, emit)
  }
}
