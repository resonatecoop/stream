const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const viewLayout = require('../../elements/view-layout')
const breadcrump = require('../../elements/breadcrump')

module.exports = ArtistTracksView

function ArtistTracksView () {
  return (state, emit) => {
    const id = parseInt(state.params.uid, 10)
    if (isNaN(id)) return emit(state.events.PUSHSTATE, '/')

    const playlist = state.cache(Playlist, `playlist-artist-${id}`).render({
      type: 'tracks',
      pagination: true,
      playlist: state.artist.tracks || []
    })

    return viewLayout((state, emit) => html`
      <section id="artist-profile" class="flex flex-column flex-auto w-100">
        <section id="content" class="flex flex-column flex-auto w-100 pb6 ph3">
          ${breadcrump({ href: `/artists/${id}`, text: 'Back to artist profile' })}
          <section id="artist-playlist" class="flex-auto">
            <h2 class="lh-title">All tracks</h2>
            ${playlist}
          </section>
        </section>
      </section>
    `)(state, emit)
  }
}
