const html = require('choo/html')

module.exports = FeedView

function FeedView () {
  return (state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
      </div>
    `
  }
}
