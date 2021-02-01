require('babel-polyfill')

const css = require('sheetify')
const choo = require('choo')

const getBase = require('./lib/base')
const Layout = require('./elements/layout')

const plugins = require('@resonate/choo-plugins')

css('@resonate/tachyons')
css('@resonate/tachyons/src/utilities/_fouc')

const app = choo()

if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')('/sw.js', { scope: '/embed' }))
}

app.use(plugins.tabbing())
app.use(plugins.theme({ iframe: true }))

app.use(require('./stores/app'))

app.route('/', Layout(require('./views/blank')))
app.route(getBase(), Layout(require('./views/main')))
app.route(getBase('/tracks'), Layout(require('./views/main')))
app.route(getBase('/track/:tid'), Layout(require('./views/track')))
app.route(getBase('/artist/:uid/albums'), Layout(require('./views/album')))
app.route(getBase('/label/:uid/albums'), Layout(require('./views/album')))

app.route('*', Layout(require('./views/404')))

module.exports = app.mount('#app')
