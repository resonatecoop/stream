import startLayout from '../layouts/start'
import { AppState } from '../types'
import Nanobus from 'nanobus'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

export type View = (state: AppState, emit: Nanobus['emit']) => HTMLElement

/**
 * This view is currently a placeholder. We only redirects to / or /discover
 */
const renderMain: View = (): HTMLElement =>
  html`<div class="vh-100"></div>`

const main = (): View => startLayout(renderMain)
export default main
