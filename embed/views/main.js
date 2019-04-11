const TITLE = 'Resonate - Embed app'
const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const playlist = state.cache(Playlist, 'embed-playlist').render({
    playlist: state.tracks
  })

  return html`
    <div class="mb6 flex flex-column flex-row-ns flex-auto">
      ${playlist}
    </div>
  `
}
