const html = require('choo/html')

module.exports = ProfileView

function ProfileView () {
  return (state, emit) => {
    return html`
      <section class="flex flex-auto flex-column w-100 pb6">

      </section>
    `
  }
}
