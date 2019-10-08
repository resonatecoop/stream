const html = require('choo/html')
const Menu = require('../components/menu')
const explore = require('./explore')
const { background } = require('@resonate/theme-skins')

module.exports = ViewLayout

/**
 * Render subview
 */

function ViewLayout (subView) {
  return (state, emit) => {
    const menu = state.cache(Menu, 'menu').render({
      title: state.shortTitle,
      href: state.href
    })

    return html`
      <div class="flex flex-column flex-auto w-100">
        <div class="${background} flex flex-column w-100 sticky z-5" style="top:var(--height-3)">
          ${menu}
        </div>
        <div class="flex flex-auto">
          <div>
            ${explore(state, emit)}
          </div>
          ${subView(state, emit)}
        </div>
      </div>
    `
  }
}
