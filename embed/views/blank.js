const html = require('choo/html')
const TITLE = 'Resonate - Embed app'

/*
 * Placeholder view for /
 */

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return html`
    <div>
    </div>
  `
}
