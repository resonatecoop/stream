const nanologger = require('nanologger')
const log = nanologger('store:labels')
const setTitle = require('../lib/title')
const Profiles = require('../components/profiles')
const Discography = require('../components/discography')
const setLoaderTimeout = require('../lib/loader-timeout')
const { getAPIServiceClient, getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST
})

module.exports = labels

/*
 * @description Store for labels
 */

/**
 * @typedef Album
 * @property [boolean] various
 * @property {TrackListItem[]} items
 */

/**
 * @typedef TrackListItem
 * @property {number} count
 * @property {number} fav
 * @property {TrackGroup[]} track_group
 * @property {string} url
 * @property {Track} track
 */

/**
 * @typedef Track
 * @property {number} id
 */

/**
 * @typedef TrackGroup
 * @property {string} title
 * @property {string} display_artist
 */

/**
 * @typedef Artist
 * @property {string} name
 * @property {number} id
 * @property {object} images
 */

/**
 * @typedef AlbumFetchResponse
 * @property {Album[]} albums
 * @property {number} totalCount
 * @property {number} numberOfPages
 */

/**
 * @typedef ArtistFetchResponse
 * @property {Artist[]} artists
 * @property {number} totalCount
 * @property {number} numberOfPages
 */

function labels () {
  return (state, emitter) => {
    state.label = state.label || {
      data: {},
      artists: {
        items: [],
        numberOfPages: 1
      },
      discography: {
        items: [],
        numberOfPages: 1
      },
      albums: {
        items: [],
        numberOfPages: 1
      },
      tracks: []
    }

    state.labels = state.labels || {
      items: [],
      numberOfPages: 1
    }

    emitter.on('route:labels', async () => {
      setMeta()

      state.cache(Profiles, 'labels')

      const component = state.components.labels
      const { machine } = component

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setLoaderTimeout(machine)
      const pageNumber = state.query.page ? Number(state.query.page) : 1

      machine.emit('request:start')

      try {
        const client = await getAPIServiceClient('labels')

        const response = await client.getLabels({
          page: pageNumber,
          limit: 50
        })

        const { data, pages } = response.body

        machine.emit('request:resolve')

        state.labels.items = data
        state.labels.numberOfPages = pages

        setMeta()

        emitter.emit(state.events.RENDER)
      } catch (err) {
        component.error = err
        machine.emit('request:reject')
        emitter.emit('error', err)
      } finally {
        machine.state.loader === 'on' && machine.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
      }
    })

    emitter.on('route:label/:id', async () => {
      const id = Number(state.params.id.split('-')[0])

      try {
        if (isNaN(id)) {
          return emitter.emit(state.events.PUSHSTATE, '/')
        }

        const isNew = !state.label.data || state.label.data.id !== id

        if (isNew) {
          state.label = {
            notFound: false,
            data: {},
            topTracks: [],
            artists: {
              items: [],
              numberOfPages: 1
            },
            discography: {
              items: [],
              numberOfPages: 1
            },
            albums: {
              items: [],
              numberOfPages: 1
            },
            tracks: []
          }

          emitter.emit(state.events.RENDER)
        } else {
          setMeta()
        }

        const client = await getAPIServiceClient('labels')
        const result = await client.getLabel({ id })
        const { body: response } = result

        state.label.data = response.data

        emitter.emit(state.events.RENDER)

        const labelID = Number(state.params.id)
        const pageNumber = state.query.page ? Number(state.query.page) : 1

        await Promise.all([
          getLabelDiscography(labelID, pageNumber),
          getLabelAlbums(labelID, pageNumber),
          getLabelArtists(labelID, pageNumber)
        ])
      } catch (err) {
        state.label.notFound = err.status === 404
        log.error(err)
      } finally {
        setMeta()
        emitter.emit(state.events.RENDER)
      }
    })

    emitter.on('route:label/:id/releases', () => {
      const labelID = Number(state.params.id)
      const pageNumber = state.query.page ? Number(state.query.page) : 1
      getLabelDiscography(labelID, pageNumber)
    })
    emitter.on('route:label/:id/artists', () => {
      const labelID = Number(state.params.id)
      const pageNumber = state.query.page ? Number(state.query.page) : 1
      getLabelArtists(labelID, pageNumber)
    })

    emitter.once('prefetch:labels', async () => {
      if (!state.prefetch) return

      setMeta()

      state.labels = state.labels || {
        items: [],
        numberOfPages: 1
      }

      const pageNumber = state.query.page ? Number(state.query.page) : 1

      const request = new Promise((resolve, reject) => {
        (async () => {
          try {
            const client = await getAPIServiceClient('labels')

            // get latest updated artists from v2 api
            const result = await client.getLabels({
              page: pageNumber,
              limit: 50
            })

            return resolve(result.body)
          } catch (err) {
            return reject(err)
          }
        })()
      })

      state.prefetch.push(request)

      const result = await request

      const { data, pages } = result.body

      if (data) {
        state.labels.items = data
        state.labels.numberOfPages = pages
      }
    })

    emitter.once('prefetch:label', async (id) => {
      if (!state.prefetch) return

      try {
        const request = new Promise((resolve, reject) => {
          (async () => {
            try {
              const client = await getAPIServiceClient('labels')

              // get latest updated artists from v2 api
              const result = await client.getLabel({
                id: id
              })

              return resolve(result.body)
            } catch (err) {
              return reject(err)
            }
          })()
        })

        state.prefetch.push(request)

        const result = await request

        const { data } = result.body

        if (data) {
          state.label.data = data
        }

        setMeta()
      } catch (err) {
        log.error(err)
      }
    })

    /**
     * @param {number} labelID
     * @param {number} pageNumber
     * @returns {Promise<void>}
     */
    async function getLabelDiscography (labelID, pageNumber) {
      state.cache(Discography, 'label-discography-' + labelID)

      const { events, machine } = state.components['label-discography-' + labelID]

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setLoaderTimeout(events)

      machine.emit('start')

      try {
        const data = await fetchLabelReleases(labelID, pageNumber)
        state.label.discography.items = data.albums
        state.label.discography.count = data.totalCount
        state.label.discography.numberOfPages = data.numberOfPages

        if (state.user.uid) {
          state.label.discography.items = await updatePlayCounts(state.user.token, state.label.discography.items)
        }

        machine.emit('resolve')

        if (!state.tracks.length && state.label.discography.items.length) {
          state.tracks = state.label.discography.items[0].items
        }

        emitter.emit(state.events.RENDER)
      } catch (err) {
        if (err.status === 404) {
          machine.emit('notFound')
        } else {
          log.error(err)
          machine.emit('reject')
        }
      } finally {
        events.state.loader === 'on' && events.emit('loader:toggle')
        setMeta()
        clearTimeout(await loaderTimeout)
      }
    }

    /**
     * @param {number} labelID
     * @param {number} pageNumber
     * @returns {Promise<void>}
     */
    async function getLabelAlbums (labelID, pageNumber) {
      state.cache(Discography, 'label-albums-' + labelID)

      const { events, machine } = state.components['label-albums-' + labelID]

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setLoaderTimeout(events)

      machine.emit('start')

      try {
        const data = await fetchLabelAlbums(labelID, pageNumber)
        state.label.albums.items = data.albums
        state.label.albums.count = data.totalCount
        state.label.albums.numberOfPages = data.numberOfPages

        if (state.user.uid) {
          state.label.albums.items = await updatePlayCounts(state.user.token, state.label.albums.items)
        }

        machine.emit('resolve')

        emitter.emit(state.events.RENDER)
      } catch (err) {
        if (err.status === 404) {
          machine.emit('notFound')
        } else {
          log.error(err)
          machine.emit('reject')
        }
      } finally {
        events.state.loader === 'on' && events.emit('loader:toggle')
        setMeta()
        clearTimeout(await loaderTimeout)
      }
    }

    /**
     * @param {number} labelID
     * @param {number} pageNumber
     * @returns {Promise<void>}
     */
    async function getLabelArtists (labelID, pageNumber) {
      state.cache(Profiles, 'label-artists-' + labelID)

      const component = state.components['label-artists-' + labelID]

      const { machine } = component

      if (machine.state.request === 'loading') {
        return
      }

      const loaderTimeout = setLoaderTimeout(machine, 500)

      machine.emit('request:start')

      try {
        const data = await fetchLabelArtists(labelID, pageNumber)

        state.label.artists.items = data.artists
        state.label.artists.count = data.totalCount
        state.label.artists.numberOfPages = data.numberOfPages

        machine.emit('request:resolve')
        setMeta()
        emitter.emit(state.events.RENDER)
      } catch (err) {
        if (err.status === 404) {
          machine.emit('request:noResults')
        } else {
          machine.emit('request:reject')
          component.error = err
          log.error(err)
        }
      } finally {
        machine.state.loader === 'on' && machine.emit('loader:toggle')
        clearTimeout(await loaderTimeout)
      }
    }

    function setMeta () {
      const { name, images = {}, description = `Listen to ${name} on Resonate` } = state.label.data

      const title = {
        labels: 'Labels',
        'label/:id': name,
        'label/:id/album/:slug': name,
        'label/:id/releases': name,
        'label/:id/artists': name
      }[state.route]

      if (!title) return

      state.shortTitle = title

      const image = {
        'artist/:id': images['profile_photo-l'] || '' // fallback
      }[state.route]

      const cover = {
        'artist/:id': images['cover_photo-l'] || '' // fallback ?
      }[state.route]

      state.meta = {
        title: setTitle(title),
        'og:description': description,
        'og:title': setTitle(title),
        'og:type': 'website',
        'og:url': 'https://beta.stream.resonate.coop' + state.href,
        'twitter:card': 'summary_large_image',
        'twitter:description': description,
        'twitter:site': '@resonatecoop',
        'twitter:title': setTitle(title)
      }

      if (image || cover) {
        state.meta['og:image'] = image || cover
        state.meta['twitter:image'] = image || cover
      }

      emitter.emit('meta', state.meta)
    }
  }
}

/**
 * Updates the play counts on all the tracks in the list of albums with the latest data from the API.
 *
 * @param {string} userToken
 * @param {Album[]} albums
 * @returns {Promise<Album[]>} A copy of the list of albums with their play counts updated.
 */
async function updatePlayCounts (userToken, albums) {
  // Get a list of all unique track IDs
  const ids = [...new Set(
    albums.map((album) => {
      return album.items.map(({ track }) => track.id)
    }).flat(1)
  )]

  // Request the play counts from the API
  const getClient = getAPIServiceClientWithAuth(userToken)
  const client = await getClient('plays')

  const { body: response } = await client.resolvePlays({
    plays: {
      ids: ids
    }
  })

  // Build a dictionary that maps track IDs to their play counts
  const counts = response.data.reduce((o, item) => {
    o[item.track_id] = item.count
    return o
  }, {})

  // Update all the tracks on each album with its play count and return the modified list of albums
  return albums.map((album) => ({
    ...album,
    items: album.items.map((trackListItem) => ({
      ...trackListItem,
      count: counts[trackListItem.track.id] || 0
    }))
  }))
}

/**
 * Fetches the label's albums.
 *
 * @param {number} labelID
 * @param {number} pageNumber
 * @returns {Promise<AlbumFetchResponse>} Returns the albums in the standardized "Album" format.
 */
async function fetchLabelAlbums (labelID, pageNumber) {
  const client = await getAPIServiceClient('labels')
  const result = await client.getLabelAlbums({
    id: labelID,
    limit: 5,
    various: true,
    page: pageNumber
  })

  const albums = result.body.data.map((album) => ({
    ...album,
    various: true,
    items: album.items.map((trackListItem) => ({
      count: 0,
      fav: 0,
      track_group: [
        {
          title: trackListItem.album,
          display_artist: trackListItem.artist
        }
      ],
      track: trackListItem,
      url: trackListItem.url || `https://api.resonate.is/v1/stream/${trackListItem.id}`
    }))
  }))

  return {
    albums: albums,
    totalCount: result.body.count,
    numberOfPages: result.body.numberOfPages || 1
  }
}

/**
 * Fetches the label's releases.
 *
 * @param {number} labelID
 * @param {number} pageNumber
 * @returns {Promise<AlbumFetchResponse>} Returns the releases in the standardized "Album" format.
 */
async function fetchLabelReleases (labelID, pageNumber) {
  const client = await getAPIServiceClient('labels')
  const result = await client.getLabelReleases({
    id: labelID,
    limit: 5,
    page: pageNumber
  })

  const albums = result.body.data.map((album) => ({
    ...album,
    items: album.items.map((trackListItem) => ({
      count: 0,
      fav: 0,
      track_group: [
        {
          title: trackListItem.track.album,
          display_artist: trackListItem.track.artist
        }
      ],
      track: trackListItem.track,
      url: trackListItem.track.url || `https://api.resonate.is/v1/stream/${trackListItem.track.id}`
    }))
  }))

  return {
    albums: albums,
    totalCount: result.body.count,
    numberOfPages: result.body.numberOfPages || 1
  }
}

/**
 * Fetches the label's artists.
 *
 * @param {number} labelID
 * @param {number} pageNumber
 * @returns {Promise<ArtistFetchResponse>} Returns the releases in the standardized "Album" format.
 */
async function fetchLabelArtists (labelID, pageNumber) {
  const client = await getAPIServiceClient('labels')
  const { body } = await client.getLabelArtists({
    id: labelID,
    limit: 20,
    page: pageNumber
  })

  return {
    artists: body.data,
    totalCount: body.count || 0,
    numberOfPages: body.numberOfPages || 1
  }
}
