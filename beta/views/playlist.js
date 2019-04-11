const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const viewLayout = require('../elements/view-layout')

module.exports = PlaylistView

function PlaylistView () {
  return (state, emit) => {
    state.title = 'Playlist'

    const playlistType = state.params.type
    const id = `playlist-${playlistType}`

    const playlist = state.cache(Playlist, id).render({
      type: playlistType,
      playlist: state.tracks
    })

    return viewLayout((state, emit) => html`
      <section id=${id} class="flex flex-column flex-auto w-100 pb5">
        ${playlist}
      </section>
    `
    )(state, emit)
  }
}
