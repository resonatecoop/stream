const html = require('choo/html')
const css = require('sheetify')
const morph = require('nanomorph')
const icon = require('@resonate/icon-element')
const button = require('@resonate/button')
const Dialog = require('@resonate/dialog-component')
const PaymentMethods = require('../../components/payment-methods')

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

const buttonStyle = css`
  :host {
    padding-top: 10px;
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

module.exports = addCredits

function addCredits (state, emit) {
  function processPayment (props) {
    const { data } = props
    const paymentMethods = state.cache(PaymentMethods, 'payment-methods')

    return html`
      <div class="tunnel">
        <div class="flex flex-auto">
          <p class="f3">Payment</p>
          ${paymentMethods.render({
            // amount: data.amount,
            // user: state.user,
            // state,
            // emit
          })}
        </div>
      </div>
    `
  }

  function renderRecap (props) {
    const { data, index } = props
    const { tokens } = prices.find(({ amount }) => amount === data.amount)
    const amount = data.amount

    return html`
      <div class="${tableStyles} tunnel">
        <div class="flex w-100 flex-auto">
          <input id=${'amount-' + index} name="amount" type="radio" checked="checked" value=${amount} />
          <label tabindex="0" for=${'amount-' + index}>
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
          <button onclick=${(e) => walk(e, { index: 0, data })} class="relative bg-white black mt4 mb3 mh3 ttu b--lightGrey ba bw1 grow br-pill pt2 pb2 pr3 pl3" type="submit" value="prev">Go back</button>
          <button onclick=${(e) => walk(e, { index: 2, data })} class="relative bg-green white mt4 mb3 mh3 ttu ba bw1 grow br-pill pt2 pb2 pr3 pl3" type="submit" value="next">Check out</button>
        </div>
      </div>
    `
  }

  function renderList (props) {
    const { data = { amount: 5 } } = props

    function updateSelection (e) {
      const val = parseInt(e.target.value, 10)
      data.amount = val
    }

    function handleKeyPress (e) {
      if (e.keyCode === 13) {
        e.preventDefault()
        e.target.control.checked = !e.target.control.checked
        const val = parseInt(e.target.control.value, 10)
        data.amount = val
      }
    }

    function priceItem (item, index) {
      const { amount, tokens } = item
      return html`
        <div class="flex w-100 flex-auto">
          <input onchange=${updateSelection} id=${'amount-' + index} name="amount" type="radio" checked=${amount === data.amount} value=${amount} />
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
      onClick: (e) => walk(e, { index: 1, data }),
      type: 'submit',
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
        <div class="${buttonStyle} flex flex-auto">
          ${nextButton}
        </div>
      </div>
    `
  }

  function walk (e, props) {
    const { index, data } = props
    e.preventDefault()
    e.stopPropagation()
    morph(document.querySelector('.tunnel'), renderTunnel({ index, data }))
  }

  function renderTunnel (props) {
    const { index } = props
    switch (index) {
      case 0:
        return renderList(props)
      case 1:
        return processPayment(props)
      default:
        return renderList(props)
    }
  }

  const dialog = new Dialog()
  const dialogEl = dialog.render({
    title: 'Top up your Resonate account',
    prefix: 'dialog-default dialog--sm',
    content: html`
      <div>
        ${renderTunnel({ index: 0, data: { amount: 5 } })}
      </div>
    `
  })

  document.body.appendChild(dialogEl)
}
