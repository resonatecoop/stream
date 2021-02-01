const html = require('choo/html')
const icon = require('@resonate/icon-element')
const { background: bg } = require('@resonate/theme-skins')

const items = [
  { href: '/artists', text: 'Artists' },
  { href: '/labels', text: 'Labels' },
  { href: '/releases', text: 'New releases' }
]

module.exports = (view) => {
  return (state, emit) => {
    return html`
      <main class="flex flex-row flex-auto w-100">
        <nav role="navigation" aria-label="Browse navigation" class="dn db-l">
          <ul class="sticky list menu ma0 pa0 flex flex-column justify-around sticky z-999" style="top:3rem">
            ${items.map(({ text, href }) => html`
              <li class="relative flex justify-center w-100${state.href === href ? ' active' : ''}">
                <a class="link b near-black near-black--light gray--dark db dim pv2 ph4 w-100" href=${href}>${text}</a>
              </li>
            `)}
          </ul>
        </nav>
        <div class="flex flex-column flex-auto">
          <div class="sticky dn-l z-999 bg-near-black top-0 top-3-l">
            <button class="${bg} br1 bn w2 h2 ma2" onclick=${() => window.history.go(-1)}>
              <div class="flex items-center justify-center">
                ${icon('arrow', { size: 'sm' })}
              </div>
            </button>
          </div>
          ${view(state, emit)}
        </div>
      </main>
    `
  }
}
