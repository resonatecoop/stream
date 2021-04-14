require('babel-polyfill')

const choo = require('choo')
const plugins = require('@resonate/choo-plugins')
const css = require('sheetify')
const app = choo()

css('@resonate/tachyons')

if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
  app.use(require('choo-service-worker/clear')())
}

app.use(require('choo-service-worker')('/sw.js', { scope: '/embed' }))

app.use(plugins.tabbing())
app.use(require('./stores/app'))

require('./routes')(app)

module.exports = app.mount('#app')
