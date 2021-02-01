const html = require('choo/html')
const viewLayout = require('../layouts/default')

/**
 * This view is currently a placeholder. We only redirects to / or /discovery
 */

module.exports = () => viewLayout(renderMain)

function renderMain () {
  return html`<div></div>`
}
