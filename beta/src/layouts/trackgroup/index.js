const html = require('choo/html')
const icon = require('@resonate/icon-element')
const { background: bg } = require('@resonate/theme-skins')

module.exports = LayoutTrackGroup

/**
 * App layout
 */

function LayoutTrackGroup (view) {
  return (state, emit) => {
    return html`
      <main class="flex flex-column flex-auto w-100">
        <div class="flex flex-column flex-row-l flex-auto w-100">
          <div class="flex flex-column sticky top-0 top-3-l z-999">
            <div class="sticky top-0 z-999 top-3-l z-999 bg-near-black bg-transparent-l">
              <button class="${bg} br1 bn w2 h2 ma2 ma3-l" style="padding:0" onclick=${() => emit('navigate:back')}>
                <div class="flex items-center justify-center">
                  ${icon('arrow', { size: 'sm' })}
                </div>
              </button>
            </div>
          </div>
          ${view(state, emit)}
        </div>
      </main>
    `
  }
}
