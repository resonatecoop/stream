// jalla only app entry point
import 'cross-fetch/polyfill'
import { isBrowser } from 'browser-or-node'
import Choo from 'choo'
import choometa from 'choo-meta'
import stores from './stores/index'
import { browser } from './browser'
import { routes } from './routes'

const app = new Choo()
app.use(choometa())

if (isBrowser) {
  browser(app)
}

stores(app)
routes(app)

export = app.mount('#app')
