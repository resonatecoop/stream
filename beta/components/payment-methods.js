const html = require('choo/html')
const Component = require('choo/component')
const isEmpty = require('validator/lib/isEmpty')
const validateFormdata = require('validate-formdata')
const input = require('@resonate/input-element')
const button = require('@resonate/button')
const morph = require('nanomorph')
const { background: bg } = require('@resonate/theme-skins')

class PaymentMethods extends Component {
  constructor (name, state, emit) {
    super(name)

    this.emit = emit
    this.state = state
    this.validator = validateFormdata()
    this.form = this.validator.state

    this.handleSubmit = this.handleSubmit.bind(this)
    this.renderNameInput = this.renderNameInput.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()

    this.validator.validate('name', this.form.values.name)

    morph(this.element.querySelector('.name-input'), this.renderNameInput())

    if (this.form.valid) {
      this.submit(e, {
        element: this.cardNumberElement,
        tokenData: {
          name: this.form.values.name
        }
      })
    }
  }

  renderNameInput () {
    const pristine = this.form.pristine
    const errors = this.form.errors
    const values = this.form.values
    const nameInput = input({
      type: 'text',
      name: 'name',
      invalid: errors.name && !pristine.name,
      theme: 'dark',
      placeholder: 'Name on card',
      value: values.name,
      onchange: (e) => {
        this.validator.validate(e.target.name, e.target.value)
        morph(this.element.querySelector('.name-input'), this.renderNameInput())
      }
    })

    return html`
      <div class="name-input mb1">
        ${nameInput}
        ${errors['name'] && !pristine['name'] ? html`<span class="message warning pb2">${errors['name'].message}</span>` : ''}
      </div>
    `
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

    const prevButton = button({
      onClick: this.prev,
      type: 'button',
      text: 'Back',
      size: 'none'
    })

    return html`
      <form novalidate onsubmit=${this.handleSubmit}>
        <div class="flex flex-column">
          ${this.renderNameInput()}
          <p class="ma0 pa0 message warning">${errors.name && !pristine.name ? errors.name.message : ''}</p>
          <div class="mb1">
            <div id="cardNumber" class="bg-black pa3"></div>
            <div id="cardNumberError"></div>
          </div>
          <div class="flex">
            <div class="mr1">
              <label class="mid-gray"  for="cardExpiry">Expiration date</label>
              <div class="mb3" style="width:123px">
                <div id="cardExpiry" class="bg-black pa3"></div>
                <div id="cardExpiryError"></div>
              </div>
            </div>
            <div>
              <label class="mid-gray" for="cardCvc">CVC</label>
              <div class="mb1" style="width:123px">
                <div id="cardCvc" class="bg-black pa3"></div>
                <div id="cardCvcError"></div>
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
        lineHeight: '1rem',
        fontWeight: 300,
        fontFamily: 'Graphik',
        fontSize: '15px',
        '::placeholder': {
          color: '#7A7E80' /* dark gray */
        }
      }
    }

    this.cardNumberElement = elements.create('cardNumber', { style })

    this.cardNumberElement.addEventListener('change', function (event) {
      const displayError = document.getElementById('cardNumberError')

      if (event.error) {
        displayError.textContent = event.error.message
      } else {
        displayError.textContent = ''
      }
    })

    this.cardNumberElement.mount('#cardNumber')

    const placeholderStyle = style
    placeholderStyle.base['::placeholder'].color = '#fff'

    const cardExpiry = elements.create('cardExpiry', { style: placeholderStyle, placeholder: '     /' })

    cardExpiry.addEventListener('change', function (event) {
      const displayError = document.getElementById('cardExpiryError')

      if (event.error) {
        displayError.textContent = event.error.message
      } else {
        displayError.textContent = ''
      }
    })

    cardExpiry.mount('#cardExpiry')

    const cardCvc = elements.create('cardCvc', { style, placeholder: '' })
    cardCvc.addEventListener('change', function (event) {
      const displayError = document.getElementById('cardCvcError')

      if (event.error) {
        displayError.textContent = event.error.message
      } else {
        displayError.textContent = ''
      }
    })
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
