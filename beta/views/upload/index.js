const html = require('choo/html')

module.exports = UploadView

function UploadView () {
  return (state, emit) => {
    return html`
      <section class="flex flex-auto flex-column w-100 pb6">
      </section>
    `
  }
}
