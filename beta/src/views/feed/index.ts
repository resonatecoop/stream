import { View } from '../main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

const renderFeed: View = (): HTMLElement => {
  return html`
    <div class="flex flex-column flex-auto w-100">
    </div>
  `
}

const feed = (): View => renderFeed
export default feed
