const html = require('choo/html')
const PaymentMethods = require('../components/payment-methods')

module.exports = Credits

function Credits () {
  return (state, emit) => {
    state.title = 'Credits'

    const paymentMethods = state.cache(PaymentMethods, 'payment-methods').render({})

    return html`
      <section id="credits" class="flex flex-auto flex-column pb6">
        ${paymentMethods}
      </section>
    `
  }
}
