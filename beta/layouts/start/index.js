const html = require('choo/html')

module.exports = (view) => {
  return (state, emit) => {
    return html`
      <main class="flex flex-row flex-auto w-100">
        ${view(state, emit)}
      </main>
    `
  }
}
