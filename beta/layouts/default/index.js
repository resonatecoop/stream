const html = require('choo/html')
const icon = require('@resonate/icon-element')
const { background: bg } = require('@resonate/theme-skins')

module.exports = LayoutDefault

/**
 * App layout
 */

function LayoutDefault (view) {
  return (state, emit) => {
    return html`
      <main class="flex flex-column flex-auto w-100">
        <div class="flex flex-column flex-auto w-100">
          <div class="sticky z-999 bg-near-black top-0 top-3-l">
            <button class="${bg} br1 bn w2 h2 ma2" onclick=${() => window.history.back()}>
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
