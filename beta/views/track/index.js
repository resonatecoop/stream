const html = require('choo/html')
const TrackDetails = require('../../components/track-details')
const viewLayout = require('../../layouts/default')
const { isNode } = require('browser-or-node')

module.exports = () => viewLayout(renderTrack)

function renderTrack (state, emit) {
  const id = Number(state.params.id)
  if (isNaN(id)) return emit(state.events.PUSHSTATE, '/')
  if (isNode) emit('prefetch:track', id)

  return html`
    <div class="flex flex-auto flex-column">
      ${state.cache(TrackDetails, `track-details-${id}`).render(state.track.data)}
    </div>
  `
}
