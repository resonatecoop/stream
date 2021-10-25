const html = require('choo/html')
const TrackDetails = require('../../components/track-details')
const viewLayout = require('../../layouts/default')
const { isNode } = require('browser-or-node')

module.exports = () => viewLayout(renderTrack)

function renderTrack (state, emit) {
  if (isNode) emit('prefetch:track', state.params.id)

  return html`
    <div class="flex flex-auto flex-column">
      ${state.cache(TrackDetails, `track-details-${state.params.id}`).render(state.track.data)}
    </div>
  `
}
