const html = require('choo/html')
const viewLayout = require('../../layouts/default')
const PlaylistForm = require('../../components/forms/trackgroup')

/**
* Edit a playlist content
*
* Route: /u/:id/playlist/:slug/edit
*
* Features:
* Title
* Privacy (public/private)
* Drag/Drop sorting
*/

module.exports = () => viewLayout(renderPlaylistEdit)

function renderPlaylistEdit (state, emit) {
  return html`
    <div class="flex flex-column flex-auto w-100 ph4">
      ${state.cache(PlaylistForm, `playlist-form-${state.params.id}-${state.params.slug}`, state, emit).render({
        data: state.playlist.data
      })}
    </div>
  `
}
