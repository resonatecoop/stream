const html = require('choo/html')

module.exports = NotFound

function NotFound () {
  return (state, emit) => {
    state.title = 'Page not found'

    return html`
      <div class="flex flex-auto">
        <div class="flex flex-column flex-auto justify-center items-center">
          <div class="measure">
            <h1 class="flex flex-column lh-title tc f2">
              404
              <small>Page not found</small>
            </h1>
          </div>
          <a href="/" class="link color-inherit dim dib grow">Go back to /</a>
        </div>
        <div class="flex flex-auto justify-center">
          <iframe src="https://beta.resonate.localhost/embed/tracks/144" theme=${state.theme === 'dark' ? 'light' : 'dark'} style="margin:0;border:none;margin-top:var(--height-1);width:400px;height:480px;border: 1px solid #000;"></iframe>
        </div>
      </div>
    `
  }
}
