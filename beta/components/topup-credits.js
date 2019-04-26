const html = require('choo/html')
const css = require('sheetify')
const nanostate = require('nanostate')
const icon = require('@resonate/icon-element')
const button = require('@resonate/button')
const Component = require('choo/component')
const PaymentMethods = require('./payment-methods')
const nanologger = require('nanologger')
const log = nanologger('topup-credits')

const iconStyle = css`
  :host {
    border: solid 1px var(--mid-gray);
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`

const tableStyles = css`
:host input[type="radio"] {
  opacity: 0;
  width: 0;
  height: 0;
}
:host input[type="radio"]:active ~ label {
  opacity: 1;
}
:host input[type="radio"]:checked ~ label {
  opacity: 1;
}
:host input[type="radio"]:checked ~ label .icon {
  fill: var(--dark-gray);
}
:host label {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
:host label .icon {
  fill: transparent;
}
:host label:hover {
  opacity: .5;
}
`

const prices = [
  {
    amount: 5,
    tokens: '4.0880',
    checked: true
  },
  {
    amount: 10,
    tokens: '8.1760'
  },
  {
    amount: 20,
    tokens: '16.3520'
  },
  {
    amount: 50,
    tokens: '40.8800'
  },
  {
    amount: 100,
    tokens: '81.760'
  }
]

class Credits extends Component {
  constructor (name, state, emit) {
    super(name)

    this.state = state
    this.emit = emit

    this.renderPayment = this.renderPayment.bind(this)
    this.renderRecap = this.renderRecap.bind(this)
    this.renderList = this.renderList.bind(this)
    this.renderCheckout = this.renderCheckout.bind(this)

    this.machine = nanostate('list', {
      list: { next: 'payment' },
      payment: { next: 'recap', prev: 'list' },
      recap: { next: 'checkout', prev: 'payment' },
      checkout: { next: 'list' }
    })

    this.machine.on('payment', () => {
      log.info('payment', this.machine.state)
      this.rerender()
    })

    this.machine.on('recap', () => {
      log.info('recap', this.machine.state)
      this.rerender()
    })

    this.machine.on('list', () => {
      log.info('list', this.machine.state)
      this.rerender()
    })

    this.machine.on('checkout', async () => {
      log.info('checkout', this.machine.state)

      try {
        const charge = await this.state.api.payments.charge({
          uid: this.state.user.uid,
          tok: this.token.id, // stripe token
          amount: 100 * this.data.amount,
          currency: 'EUR'
        })

        console.log(charge)

        this.rerender()
      } catch (err) {
        // TODO handle err
        console.log(err)
      }
    })

    this.index = 0
    this.data = prices[this.index]
  }

  createElement () {
    const template = {
      'list': this.renderList,
      'payment': this.renderPayment,
      'recap': this.renderRecap,
      'checkout': this.renderCheckout
    }[this.machine.state]

    return template()
  }

  renderCheckout () {
    return html`
      <div class="tunnel">
        <div class="flex flex-column">
          <p class="f3">Success</p>
        </div>
      </div>
    `
  }

  renderPayment () {
    const paymentMethods = this.state.cache(PaymentMethods, 'payment-methods')
    const self = this

    async function submit (e, { element: cardElement, tokenData }) {
      e.preventDefault()
      e.stopPropagation()

      if (self.state.stripe) {
        try {
          const response = await self.state.stripe.createToken(cardElement, tokenData)

          self.token = response.token

          self.machine.emit('next')
        } catch (err) {
          console.log(err)
          self.machine.emit('error')
        }
      }
    }

    return html`
      <div class="tunnel">
        <div class="flex flex-column">
          <p class="f3">Payment</p>
          ${paymentMethods.render({ submit })}
        </div>
      </div>
    `
  }

  renderRecap () {
    const { tokens } = prices.find(({ amount }) => amount === this.data.amount)
    const amount = this.data.amount

    const prevButton = button({
      onClick: (e) => { e.preventDefault(); this.machine.emit('prev'); return false },
      type: 'button',
      text: 'Check out',
      size: 'none'
    })

    const nextButton = button({
      onClick: (e) => { e.preventDefault(); this.machine.emit('next'); return false },
      type: 'button',
      text: 'Check out',
      size: 'none'
    })

    return html`
      <div class="${tableStyles} tunnel">
        <div class="flex w-100 flex-auto">
          <input id=${'amount-' + this.index} name="amount" type="radio" checked="checked" value=${amount} />
          <label tabindex="0" for=${'amount-' + this.index}>
            <div class="pa3 flex justify-center w-100 flex-auto">
              ${icon('circle', { 'class': 'icon icon--sm' })}
            </div>
            <div class="pa3 flex w-100 flex-auto">
              €${amount}
            </div>
            <div class="pa3 flex w-100 flex-auto">
              ${tokens}
            </div>
          </label>
        </div>
        <div class="flex flex-auto justify-center">
          ${prevButton}
          ${nextButton}
        </div>
      </div>
    `
  }

  renderList () {
    const self = this

    const updateSelection = (e) => {
      const val = parseInt(e.target.value, 10)
      log.info(`select:${val}`)
      const index = prices.findIndex((item) => item.amount === val)
      self.data = prices[index]
      console.log(self.data)
    }

    const handleKeyPress = (e) => {
      if (e.keyCode === 13) {
        e.preventDefault()
        e.target.control.checked = !e.target.control.checked
        const val = parseInt(e.target.control.value, 10)
        const index = prices.findIndex((item) => item.amount === val)
        self.data = prices[index]
      }
    }

    const priceItem = (item, index) => {
      const { amount, tokens } = item

      return html`
        <div class="flex w-100 flex-auto">
          <input onchange=${updateSelection} id=${'amount-' + index} name="amount" type="radio" checked=${amount === self.data.amount} value=${amount} />
          <label tabindex="0" onkeypress=${handleKeyPress} for=${'amount-' + index}>
            <div class="pa3 flex w-100 flex-auto">
              <div class="${iconStyle}">
                ${icon('circle', { 'class': 'icon icon--xs' })}
              </div>
            </div>
            <div class="pa3 flex w-100 flex-auto f3">
              €${amount}
            </div>
            <div class="pa3 flex w-100 flex-auto f3 dark-gray">
              ${tokens}
            </div>
          </label>
        </div>
      `
    }

    const nextButton = button({
      onClick: (e) => { e.preventDefault(); this.machine.emit('next'); return false },
      type: 'button',
      text: 'Next',
      size: 'none'
    })

    return html`
      <div class="${tableStyles} tunnel">
        <div class="flex flex-column">
          <p class="f3">Add Credits</p>
          <p class="f4">How much would you like to top up?</p>
          <div class="flex">
            <div class="pa3 flex w-100 flex-auto">
            </div>
            <div class="pa3 flex w-100 flex-auto">
            </div>
            <div class="pa3 flex w-100 flex-auto f4 mid-gray">
              Credits
            </div>
          </div>
          ${prices.map(priceItem)}
        </div>
        <div class="flex flex-auto mt3">
          ${nextButton}
        </div>
      </div>
    `
  }

  update () {
    return false
  }
}

module.exports = Credits
