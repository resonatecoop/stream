const matchMedia = require('../lib/match-media')
const Explore = require('../components/explore')

module.exports = (state, emit) => {
  if (matchMedia('lg')) return state.cache(Explore, 'explore').render({ user: state.user })
}
