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

// This needs to be exported in this common-js-compatible manner since the Choo server won't be able to import it
// properly otherwise (which will break SSR). Please also note that the Choo return type for `mount` is incorrect.
// It is not `void` when ran on a server.
export = app.mount('#app')
