const html = require('choo/html')
const subView = require('../../layouts/default')

module.exports = FaqView

function FaqView () {
  return subView((state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
      </div>
    `
  })
}
