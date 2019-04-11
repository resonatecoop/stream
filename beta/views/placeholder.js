const html = require('choo/html')

/*
 * Empty route
 */

module.exports = placeholderView

function placeholderView () {
  return (state, emit) => {
    return html`
      <div></div>
    `
  }
}
