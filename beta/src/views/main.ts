import viewLayout from '../layouts/start'
import { AppState } from '../types'
import Nanobus from 'nanobus'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

export type View = (state: AppState, emit: Nanobus['emit']) => HTMLElement

/**
 * This view is currently a placeholder. We only redirects to / or /discover
 */

const main = (): View => viewLayout(renderMain)

function renderMain (): HTMLElement {
  return html`<div class="vh-100"></div>`
}

export default main
