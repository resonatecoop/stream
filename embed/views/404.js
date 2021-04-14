const html = require('choo/html')

module.exports = view

function view (state, emit) {
  return html`
    <div class="flex flex-column flex-auto w-100 items-center justify-center">
      <div>
        <h1>Route not found.</h1>
        <a class="pt2" href="/embed">Back to /embed.</a>
      </div>
    </div>
  `
}
