const Layout = require('./elements/layout')

module.exports = (app) => {
  app.route('/', Layout(require('./views/main.js')))
  app.route('/welcome', Layout(require('./views/welcome')))
  app.route('/explore', Layout(require('./views/explore')))
  app.route('/artists', Layout(require('./views/artists')))
  app.route('/artist/:id', Layout(require('./views/artist')))
  app.route('/artist/:id/releases', Layout(require('./views/releases')))
  app.route('/artist/:id/album/:slug', Layout(require('./views/album')))
  app.route('/u/:id', Layout(require('./views/user')))
  app.route('/u/:id/playlist/:slug', Layout(require('./views/playlist')))
  app.route('/u/:id/library', Layout(require('./views/library')))
  app.route('/u/:id/library/playlists', Layout(require('./views/library/playlists')))
  app.route('/u/:id/library/history', Layout(require('./views/library/history')))
  app.route('/u/:id/library/:type', Layout(require('./views/library')))
  app.route('/releases', Layout(require('./views/releases')))
  app.route('/labels', Layout(require('./views/labels')))
  app.route('/label/:id', Layout(require('./views/label')))
  app.route('/track/:id', Layout(require('./views/track')))
  app.route('/login', Layout(require('./views/login')))
  app.route('/search', Layout(require('./views/search')))
  app.route('/search/:q', Layout(require('./views/search')))
  app.route('/search/:q/:kind', Layout(require('./views/search')))
  app.route('/tag/:tag', Layout(require('./views/tag')))
  app.route('/feed', Layout(require('./views/feed')))
  app.route('/discovery', Layout(require('./views/discovery')))
  app.route('/discovery/:type', Layout(require('./views/discovery/playlist')))
  app.route('/faq', Layout(require('./views/faq')))
  app.route('/upload', Layout(require('./views/upload')))
  app.route('/profile/membership', Layout(require('./views/profile/membership')))
  app.route('/profile/stats', Layout(require('./views/profile/stats')))
  app.route('/*', Layout(require('./views/notFound.js')))
}
