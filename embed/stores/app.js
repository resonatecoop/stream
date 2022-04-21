const html = require('choo/html')

// logging
const logger = require('nanologger')
const log = logger('embed-app')

// legacy api
const generateApi = require('../lib/api')

// v2 api docs
const SwaggerClient = require('swagger-client')

const Dialog = require('@resonate/dialog-component')
const Playlist = require('@resonate/playlist-component')

module.exports = store

/**
 * Main application store
 * @param {object} state Choo state
 * @param {object} emitter Nanobus instance
 */

function store (state, emitter) {
  state.user = state.user || {
    credits: 0
  }
  state.tracks = state.tracks || []
  state.track = state.track || {
    data: {
      track: {},
      track_group: []
    }
  }
  state.release = state.release || {
    data: {}
  }
  state.playlist = state.playlist || {
    data: {}
  }
  state.releases = state.releases || []

  state.api = generateApi()

  emitter.on('route:embed/track/:id', async () => {
    try {
      const url = new URL('/api/v3/tracks/apiDocs', process.env.APP_HOST || 'https://stream.resonate.coop')

      url.search = new URLSearchParams({
        type: 'apiDoc',
        basePath: '/api/v3/tracks'
      })

      const client = await new SwaggerClient(url.href)
      const { body } = await client.apis.tracks.getTrack({ id: state.params.id })
      const { data } = body

      state.track.data = {
        count: 0,
        fav: 0,
        track: data,
        url: data.url,
        track_group: [
          {
            title: data.album,
            display_artist: data.artist
          }
        ]
      }

      emitter.emit(state.events.RENDER)
    } catch (err) {
      log.error(err)
    }
  })

  emitter.on('route:embed/u/:id/playlist/:slug', async () => {
    const cid = `playlist-${state.params.id}`

    state.cache(Playlist, cid)

    const component = state.components[cid]

    const { machine, events } = component

    const loaderTimeout = setTimeout(() => {
      machine.state.loader === 'off' && machine.emit('loader:toggle')
    }, 300)

    machine.emit('start')

    try {
      let url = new URL('/api/v3/resolve/apiDocs', process.env.APP_HOST || 'https://stream.resonate.coop')

      url.search = new URLSearchParams({
        type: 'apiDoc',
        basePath: '/api/v3/resolve'
      })

      let client = await new SwaggerClient(url.href)

      url = new URL(state.href.replace('/embed', '') || '/', process.env.APP_HOST || 'https://stream.resonate.coop')
      let response = await client.apis.resolve.resolve({ url: url.href })

      url = new URL('/api/v3/trackgroups/apiDocs', process.env.APP_HOST || 'https://stream.resonate.coop')

      url.search = new URLSearchParams({
        type: 'apiDoc',
        basePath: '/api/v3/trackgroups'
      })

      client = await new SwaggerClient(url.href)

      response = await client.apis.trackgroups.getTrackgroup({ id: response.body.data.id })

      state.playlist.data = response.body.data

      state.playlist.tracks = state.playlist.data.items.map((item) => {
        return {
          count: 0,
          fav: 0,
          track_group: [
            item
          ],
          track: item.track,
          url: item.track.url || `https://api.resonate.is/v1/stream/${item.track.id}`
        }
      })

      if (!state.tracks.length) {
        state.tracks = state.playlist.tracks
        state.track.data = state.tracks[0]
      }

      machine.emit('resolve')

      emitter.emit(state.events.RENDER)
    } catch (err) {
      machine.emit('reject')
      log.error(err)
    } finally {
      events.state.loader === 'on' && events.emit('loader:toggle')
      clearTimeout(loaderTimeout)
    }
  })

  emitter.on('route:embed/artist/:id/release/:slug', async () => {
    const cid = `release-${state.params.id}`

    state.cache(Playlist, cid)

    const component = state.components[cid]

    const { machine, events } = component

    const loaderTimeout = setTimeout(() => {
      machine.state.loader === 'off' && machine.emit('loader:toggle')
    }, 300)

    machine.emit('start')

    try {
      let url = new URL('/api/v3/resolve/apiDocs', process.env.APP_HOST || 'https://stream.resonate.coop')

      url.search = new URLSearchParams({
        type: 'apiDoc',
        basePath: '/api/v3/resolve'
      })

      let client = await new SwaggerClient(url.href)

      url = new URL(state.href.replace('/embed', '') || '/', process.env.APP_HOST || 'https://stream.resonate.coop')
      let response = await client.apis.resolve.resolve({ url: url.href })

      url = new URL('/api/v3/trackgroups/apiDocs', process.env.APP_HOST || 'https://stream.resonate.coop')

      url.search = new URLSearchParams({
        type: 'apiDoc',
        basePath: '/api/v3/trackgroups'
      })

      client = await new SwaggerClient(url.href)

      response = await client.apis.trackgroups.getTrackgroup({ id: response.body.data.id })

      state.release.data = response.body.data

      state.release.tracks = state.release.data.items.map((item) => {
        return {
          count: 0,
          fav: 0,
          track_group: [
            item
          ],
          track: item.track,
          url: item.track.url || `https://api.resonate.is/v1/stream/${item.track.id}`
        }
      })

      if (!state.tracks.length) {
        state.tracks = state.release.tracks
        state.track.data = state.tracks[0]
      }

      machine.emit('resolve')

      emitter.emit(state.events.RENDER)
    } catch (err) {
      machine.emit('reject')
      log.error(err)
    } finally {
      events.state.loader === 'on' && events.emit('loader:toggle')
      clearTimeout(loaderTimeout)
    }
  })

  emitter.on('route:*', () => {
    // do something about 404
  })

  emitter.on(state.events.DOMCONTENTLOADED, () => {
    emitter.emit(`route:${state.route}`)
  })

  emitter.on('player:cap', async (props) => {
    const { id } = props

    try {
      await state.api.plays.add({
        uid: 0, // anon
        tid: id
      })

      const dialog = document.body.querySelector('dialog')

      if (!dialog) {
        const dialogComponent = state.cache(Dialog, 'join-resonate')

        const dialogEl = dialogComponent.render({
          prefix: 'dialog-bottom bg-white black',
          content: html`
            <div>
              <p class="lh-copy f4 pa3">
                You are previewing Resonate.<br>
                <a href="https://resonate.is/join" target="_blank" rel="noopener">Join now</a> and earn free credits.</p>
            </div>
          `,
          onClose: function (e) {
            dialog.destroy()
          }
        })

        document.body.appendChild(dialogEl)
      }
    } catch (err) {
      log.error(err)
    }
  })

  emitter.on('player:error', ({ message }) => {
    emitter.emit('notify', { message })
  })

  emitter.on(state.events.NAVIGATE, () => {
    emitter.emit(`route:${state.route}`)
    window.scrollTo(0, 0)
  })
}
