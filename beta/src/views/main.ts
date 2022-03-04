import viewLayout from '../layouts/start'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

export type View = (state, emit) => HTMLElement

/**
 * This view is currently a placeholder. We only redirects to / or /discover
 */

const main = (): View => viewLayout(renderMain)

function renderMain (): HTMLElement {
  return html`<div class="vh-100"></div>`
}

export default main
