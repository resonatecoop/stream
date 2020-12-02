const html = require('choo/html')
const viewLayout = require('../../layouts/default')

module.exports = UserView

function UserView () {
  return (state, emit) => {
    return viewLayout((state, emit) => {
      return html`
        <section id="user-profile" class="flex flex-column flex-auto w-100">
        </section>
      `
    })(state, emit)
  }
}
