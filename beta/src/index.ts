// jalla only app entry point
import 'cross-fetch/polyfill'
import { isBrowser } from 'browser-or-node'
import Choo from 'choo'
import choometa from 'choo-meta'
import stores from './stores/index.js'
import { routes } from './routes'

async function initialize (): Promise<void> {
  const app = new Choo()
  app.use(choometa())

  if (isBrowser) {
    const { browser } = await import('./browser')
    await browser(app)
  }

  stores(app)
  routes(app)

  app.mount('#app')
}

void initialize()
