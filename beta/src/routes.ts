import Layout from './elements/layout'
import artists from './views/artists'
import discover from './views/discover'
import edit from './views/playlist/edit'
import faq from './views/faq'
import feed from './views/feed'
import history from './views/library/history'
import labels from './views/labels'
import library from './views/library'
import main from './views/main'
import membership from './views/profile/membership'
import notfound from './views/404'
import playlist from './views/playlist'
import playlists from './views/library/playlists'
import profile from './views/profile'
import profileArtists from './views/profile/artists'
import profileReleases from './views/profile/releases'
import release from './views/release'
import releases from './views/releases'
import search from './views/search'
import settings from './views/settings'
import tag from './views/tag'
import track from './views/track'
import tracks from './views/tracks'

export const routes = (app): void => {
  app.route('/', Layout(main))
  app.route('/artists', Layout(artists))
  app.route('/artist', Layout(main))
  app.route('/artist/:id', Layout(profile))
  app.route('/artist/:id/releases', Layout(profileReleases))
  app.route('/artist/:id/release/:slug', Layout(release))
  app.route('/u', Layout(main))
  app.route('/u/:id', Layout(profile))
  app.route('/u/:id/playlist/:slug', Layout(playlist))
  app.route('/u/:id/playlist/:slug/edit', Layout(edit))
  app.route('/u/:id/library', Layout(library))
  app.route('/u/:id/library/playlists', Layout(playlists))
  app.route('/u/:id/library/history', Layout(history))
  app.route('/u/:id/library/:type', Layout(library))
  app.route('/u/:id/membership', Layout(membership))
  app.route('/discover', Layout(discover))
  app.route('/discovery', Layout(main)) // redirects to discover
  app.route('/releases', Layout(releases))
  app.route('/tracks', Layout(tracks))
  app.route('/labels', Layout(labels))
  app.route('/label', Layout(main))
  app.route('/label/:id', Layout(profile))
  app.route('/label/:id/artists', Layout(profileArtists))
  app.route('/label/:id/releases', Layout(profileReleases))
  app.route('/track', Layout(main))
  app.route('/track/:id', Layout(track))
  app.route('/search', Layout(search))
  app.route('/tag', Layout(tag))
  app.route('/feed', Layout(feed))
  app.route('/settings', Layout(settings))
  app.route('/faq', Layout(faq))
  app.route('/404', Layout(notfound))
  app.route('/*', Layout(notfound))
}
