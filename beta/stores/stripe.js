const { isBrowser } = require('browser-or-node')

function stripe () {
  return (state, emitter) => {
    if (isBrowser) {
      state.stripe = Stripe(process.env.STRIPE_TOKEN) /* global Stripe */
    }

    emitter.on('DOMContentLoaded', () => {
      emitter.on('stripe:charge', async ({ token, amount }) => {
        try {
          const charge = await state.api.payments.charge({
            uid: state.user.uid,
            tok: token.id,
            amount: 100 * amount,
            currency: "EUR"
          })

          console.log(charge)
        } catch (err) {
          console.log(err)
        }
      })
    })
  }
}

module.exports = stripe
