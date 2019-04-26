const { isBrowser } = require('browser-or-node')

function stripe () {
  return (state, emitter) => {
    if (isBrowser) {
      state.stripe = Stripe(process.env.STRIPE_TOKEN) /* global Stripe */
    }
  }
}

module.exports = stripe
