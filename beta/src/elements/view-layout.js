const html = require('choo/html')

module.exports = ViewLayout

/**
 * Render subview
 */

function ViewLayout (subView) {
  return (state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
        ${subView(state, emit)}
      </div>
    `
  }
}
