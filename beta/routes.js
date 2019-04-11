const Layout = require('./elements/layout')

module.exports = (app) => {
  app.route('/', Layout(require('./views/dashboard')))
  app.route('/playlist/:type', Layout(require('./views/playlist')))
  app.route('/artists', Layout(require('./views/artists/list')))
  app.route('/artists/:uid', Layout(require('./views/artists/show')))
  app.route('/artists/:uid/:tab', Layout(require('./views/artists/show')))
  app.route('/labels', Layout(require('./views/labels/list')))
  app.route('/labels/:uid', Layout(require('./views/labels/show')))
  app.route('/labels/:uid/:tab', Layout(require('./views/labels/show')))
  app.route('/tracks/:id', Layout(require('./views/tracks/show')))
  app.route('/login', Layout(require('./views/login')))
  app.route('/search/:q', Layout(require('./views/search')))
  app.route('/search/:q/:tab', Layout(require('./views/search')))
  app.route('/account', Layout(require('./views/profile/show')))
  app.route('/:user/library/:type', Layout(require('./views/playlist')))
  app.route('/:user', Layout(require('./views/placeholder')))
  app.route('/:user/*', Layout(require('./views/404')))
}
