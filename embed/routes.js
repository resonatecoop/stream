const getBase = require('./lib/base')
const Layout = require('./elements/layout')

module.exports = routes

/*
 * @description Choo routes
 * @param {object} app Choo app
 */

function routes (app) {
  app.route('/', Layout(require('./views/main')))
  app.route(getBase(), Layout(require('./views/main')))
  app.route(getBase('/track'), Layout(require('./views/track')))
  app.route(getBase('/track/:id'), Layout(require('./views/track')))
  app.route(getBase('/artist/:id/release/:slug'), Layout(require('./views/release')))
  app.route(getBase('/u/:id/playlist/:slug'), Layout(require('./views/playlist')))
  app.route('/*', Layout(require('./views/404')))
}
