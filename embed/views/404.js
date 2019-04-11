const html = require('choo/html')
const TITLE = 'embed - route not found'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return html`
    <div>
      <h1>Route not found.</h1>
      <a class="pt2" href="/">Back to main.</a>
    </div>
  `
}
