const html = require('choo/html')
const subView = require('../../layouts/default')

module.exports = () => subView(renderNotFound)

function renderNotFound () {
  return html`
    <div class="flex flex-column flex-auto justify-center items-center pb6">
      <div class="measure">
        <h1 class="flex flex-column lh-title fw1 tc f2">
          404
          <small>Page not found</small>
        </h1>
      </div>
      <a href="/" class="link color-inherit dim dib grow">Go back to /</a>
    </div>
  `
}
