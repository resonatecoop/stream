const { getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST,
  fullClient: true, // return full client
  base: process.env.API_BASE || '/api/v3'
})

/**
 * @description Resolve plays and favorites
 * @param {Array.<number>} ids Track ids
 */
function resolvePlaysAndFavorites (ids) {
  /**
   * @param {Object} state Choo state
   */
  return async (state) => {
    let counts = {}
    let favorites = {}

    const getClient = getAPIServiceClientWithAuth(state.user.token)

    const client1 = await getClient('plays')
    const res1 = await client1.execute({ operationId: 'resolvePlays', parameters: { plays: { ids } } })

    if (res1) {
      const { data } = res1.body

      if (data) {
        counts = data.reduce((o, item) => {
          o[item.track_id] = item.count
          return o
        }, {})
      }
    }

    const client2 = await getClient('favorites')
    const res2 = await client2.execute({ operationId: 'resolveFavorites', parameters: { favorites: { ids } } })

    if (res2) {
      const { data } = res2.body

      if (data) {
        favorites = data.reduce((o, item) => {
          o[item.track_id] = item.track_id
          return o
        }, {})
      }
    }

    return [counts, favorites]
  }
}

module.exports = resolvePlaysAndFavorites
