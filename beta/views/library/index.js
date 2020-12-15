const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const Pagination = require('../../components/pagination')
const viewLayout = require('../../layouts/library')

module.exports = LibraryView

function LibraryView () {
  return viewLayout((state, emit) => {
    const playlistType = state.params.type || 'favorites'
    const id = `playlist-${playlistType}`
    const { numberOfPages: pages } = state.library

    return html`
      <div class="flex flex-column flex-auto w-100 min-vh-100 ph3">
        ${state.cache(Playlist, id).render({
          type: playlistType,
          playlist: state.library.items || []
        })}
        ${state.cache(Pagination, playlistType + '-pagination').render({
          page: Number(state.query.page) || 1,
          pages: pages
        })}
      </div>
    `
  })
}
