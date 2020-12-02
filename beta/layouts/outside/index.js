const html = require('choo/html')
const HeaderOutside = require('../../components/header/outside')

module.exports = LayoutOutside

/**
 * Strictly outside view layout
 */

function LayoutOutside (view) {
  return (state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
        ${state.cache(HeaderOutside, 'header-outside').render({
          href: state.href,
          loggedIn: state.resolved && !!state.user.uid
        })}
        <main>
          ${view(state, emit)}
        </main>
      </div>
    `
  }
}
