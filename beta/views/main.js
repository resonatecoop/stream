const html = require('choo/html')
const subView = require('../layouts/default')

/**
 * This view is currently a placeholder. We only redirects to /welcome or /discovery
 */

module.exports = MainView

function MainView () {
  return subView((state, emit) => {
    return html`<div class="flex flex-auto flex-column w-100 vh-100"></div>`
  })
}
