const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const viewLayout = require('../../layouts/library')

module.exports = () => viewLayout(renderPicks)

function renderPicks (state, emit) {
  const playlistType = 'favorites'
  const id = `playlist-${playlistType}`

  return html`
    <div class="flex flex-column flex-row-l flex-auto w-100">
      ${state.cache(Playlist, id).render({
        type: playlistType,
        pagination: true,
        playlist: state.library.items || [],
        numberOfPages: state.library.numberOfPages
      })}
    </div>
  `
}
