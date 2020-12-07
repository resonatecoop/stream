const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const viewLayout = require('../../layouts/library')

module.exports = LibraryView

function LibraryView () {
  return viewLayout((state, emit) => {
    const playlistType = state.params.type || 'picks'
    const id = `playlist-${playlistType}`

    return html`
      <div class="flex flex-column flex-auto w-100 min-vh-100 ph3">
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
