const html = require('choo/html')

module.exports = ExploreView

function ExploreView () {
  return (state, emit) => {
    return html`
      <section class="flex flex-auto flex-column w-100 pb6">
      </section>
    `
  }
}
