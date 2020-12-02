const html = require('choo/html')
const Header = require('../../components/header')

module.exports = LayoutBrowse

/**
 * App layout
 */

function LayoutBrowse (view) {
  return (state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
        ${state.cache(Header, 'header').render({
          credits: state.user ? state.user.credits : 0,
          user: state.user,
          href: state.href,
          resolved: state.resolved
        })}
        <main class="flex flex-row flex-auto w-100 pb6">
          <div class="dn db-l sticky top-0 z-999">
            <nav role="navigation" aria-label="Browse navigation" class="sticky z-999" style="top:3rem">
              <ul class="list ma0 pa0 flex flex-column justify-around">
                <li>
                  <a class="link b gray db dim pv2 ph4 mr2 w-100" href="/artists">Artists</a>
                </li>
                <li>
                  <a class="link b gray db dim pv2 ph4 mr2 w-100" href="/labels">Labels</a>
                </li>
              </ul>
            </nav>
          </div>
          ${view(state, emit)}
        </main>
      </div>
    `
  }
}
