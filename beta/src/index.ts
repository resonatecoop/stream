// jalla only app entry point
require('cross-fetch/polyfill')
const { isBrowser } = require('browser-or-node')
const choo = require('choo')

const app = choo()
app.use(require('choo-meta')())

if (isBrowser) {
  require('./browser')(app)
}

require('./stores/index.js')(app)
require('./routes')(app)

module.exports = app.mount('#app')
