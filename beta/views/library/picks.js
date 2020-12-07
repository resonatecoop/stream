const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const viewLayout = require('../../layouts/library')

module.exports = LibraryPicksView

function LibraryPicksView () {
  return viewLayout((state, emit) => {
    const playlistType = 'picks'
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
  })
}
