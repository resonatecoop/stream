import { View } from '../../views/main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

const start = (view: View): View => {
  return (state, emit) => {
    return html`
      <main class="flex flex-row flex-auto w-100">
        ${view(state, emit)}
      </main>
    `
  }
}

export default start
