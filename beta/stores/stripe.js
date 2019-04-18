const { isBrowser } = require('browser-or-node')

function stripe () {
  return (state, emitter) => {
    if (isBrowser) {
      state.stripe = Stripe(process.env.STRIPE_TOKEN) /* global Stripe */
    }

    emitter.on('DOMContentLoaded', () => {
      emitter.on('stripe:charge', async ({ element: cardElement, options }) => {
        try {
          const response = await state.stripe.createToken(cardElement, options)

          const { token } = response

          console.log(token)

          const charge = await state.api.payments.charge({ uid: state.user.uid, tok: token.id })

          console.log(charge)
        } catch (err) {
          console.log(err)
        }
      })
    })
  }
}

module.exports = stripe
