const html = require('choo/html')
const Component = require('choo/component')
const isEmpty = require('validator/lib/isEmpty')
// const isLength = require('validator/lib/isLength')
const validateFormdata = require('validate-formdata')
const input = require('@resonate/input-element')
const button = require('@resonate/button')

class PaymentMethods extends Component {
  constructor (name, state, emit) {
    super(name)

    this.emit = emit
    this.state = state
    this.validator = validateFormdata()
    this.form = this.validator.state

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()
    this.submit(e, {
      element: this.cardNumberElement,
      tokenData: {
        name: this.form.values.name
      }
    })
  }

  createElement (props) {
    this.submit = props.submit
    this.prev = props.prev
    this.validator = props.validator || this.validator
    this.form = props.form || this.form || {
      changed: false,
      valid: true,
      pristine: {},
      required: {},
      values: {},
      errors: {}
    }

    const pristine = this.form.pristine
    const errors = this.form.errors
    const values = this.form.values

    const nameInput = input({
      type: 'text',
      name: 'name',
      invalid: errors.name && !pristine.name,
      placeholder: 'Name on card',
      value: values.name,
      onchange: (e) => {
        this.validator.validate(e.target.name, e.target.value)
        // this.rerender()
      }
    })

    const prevButton = button({
      onClick: this.prev,
      type: 'button',
      text: 'Back',
      size: 'none'
    })

    return html`
      <form novalidate onsubmit=${this.handleSubmit}>
        <div class="flex flex-column">
          <div class="mb1">
            ${nameInput}
          </div>
          <p class="ma0 pa0 message warning">${errors.name && !pristine.name ? errors.name.message : ''}</p>
          <div class="mb1">
            <div id="cardNumber" class="bg-black white"></div>
          </div>
          <div class="flex">
            <div class="mr1">
              <label class="mid-gray"  for="cardExpiry">Expiration date</label>
              <div class="mb3" style="width:123px">
                <div id="cardExpiry" class="bg-black white"></div>
              </div>
            </div>
            <div>
              <label class="mid-gray" for="cardCvc">CVC</label>
              <div class="mb1" style="width:123px">
                <div id="cardCvc" class="bg-black white"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-auto justify-between">
          ${prevButton}
          ${button({ type: 'submit', size: 'none', text: 'Next' })}
        </div>
      </form>
    `
  }

  unload () {
    this.reset()
  }

  reset () {
    this.validator = validateFormdata()
    this.form = this.validator.state
  }

  load () {
    const elements = this.state.stripe.elements()

    const style = {
      base: {
        iconColor: '#fff',
        color: '#fff',
        lineHeight: '40px',
        fontWeight: 300,
        fontFamily: 'Graphik',
        fontSize: '15px',
        '::placeholder': {
          color: '#CFD7E0'
        }
      }
    }

    this.cardNumberElement = elements.create('cardNumber', { style })
    this.cardNumberElement.mount('#cardNumber')

    const cardExpiry = elements.create('cardExpiry', { style })
    cardExpiry.mount('#cardExpiry')
    const cardCvc = elements.create('cardCvc', { style })
    cardCvc.mount('#cardCvc')

    this.validator.field('name', (data) => {
      if (isEmpty(data)) return new Error('Card name is required')
    })
  }

  update () {
    return false
  }
}

module.exports = PaymentMethods
