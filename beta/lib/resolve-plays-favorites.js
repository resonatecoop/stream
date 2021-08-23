const hash = require('promise-hash/lib/promise-hash')
const { getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST,
  fullClient: true // return full client
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

    const { client1, client2 } = await hash({
      client1: getClient('plays'),
      client2: getClient('favorites')
    })

    const { res1, res2 } = await hash({
      res1: client1.execute({ operationId: 'resolvePlays', parameters: { plays: { ids } } }),
      res2: client2.execute({ operationId: 'resolveFavorites', parameters: { favorites: { ids } } })
    })

    if (res1) {
      const { data } = res1.body

      if (data) {
        counts = data.reduce((o, item) => {
          o[item.track_id] = item.count
          return o
        }, {})
      }
    }

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
