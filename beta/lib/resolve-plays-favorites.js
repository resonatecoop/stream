const hash = require('promise-hash/lib/promise-hash')

/**
 * @description Resolve plays and favorites
 * @param {Array} ids Track ids
 */
function resolvePlaysAndFavorites (ids) {
  /**
   * @param {Object} state Choo state
   */
  return async (state) => {
    // TODO replace with v2 swagger api gen
    const { res1, res2 } = await hash({
      res1: state.apiv2.plays.resolve({ ids }),
      res2: state.apiv2.favorites.resolve({ ids })
    })

    const counts = res1.data.reduce((o, item) => {
      o[item.track_id] = item.count
      return o
    }, {})

    const favorites = res2.data.reduce((o, item) => {
      o[item.track_id] = item.track_id
      return o
    }, {})

    return [counts, favorites]
  }
}

module.exports = resolvePlaysAndFavorites
