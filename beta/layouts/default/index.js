const html = require('choo/html')
const Header = require('../../components/header')

module.exports = LayoutDefault

/**
 * App layout
 */

function LayoutDefault (view) {
  return (state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
        ${state.cache(Header, 'header').render({
          credits: state.user ? state.user.credits : 0,
          user: state.user,
          href: state.href,
          resolved: state.resolved
        })}
        <main>${view(state, emit)}</main>
      </div>
    `
  }
}
