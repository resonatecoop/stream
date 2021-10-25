const html = require('choo/html')
const viewLayout = require('../../layouts/library')
const Trackgroups = require('../../components/trackgroups')

module.exports = () => viewLayout(renderPlaylists)

function renderPlaylists (state, emit) {
  return html`
    <div class="flex flex-column flex-auto w-100">
      ${state.cache(Trackgroups, `playlists-${state.params.id}`).render({
        items: state.playlists.items || []
      })}
    </div>
  `
}
