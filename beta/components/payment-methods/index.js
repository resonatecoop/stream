const html = require('choo/html')
const Component = require('choo/component')
const isEmpty = require('validator/lib/isEmpty')
const validateFormdata = require('validate-formdata')
const input = require('@resonate/input-element')
const button = require('@resonate/button')
const Button = require('@resonate/button-component')
const morph = require('nanomorph')

class PaymentMethods extends Component {
  constructor (name, state, emit) {
    super(name)

    this.emit = emit
    this.state = state
    this.validator = validateFormdata()
    this.form = this.validator.state
  }

  createElement (props) {
    const self = this
    const state = this.state
    const emit = this.emit

    const onSubmit = props.onSubmit
    const onPrev = props.onPrev

    this.validator = props.validator || this.validator
    this.form = props.form || this.form || {
      changed: false,
      valid: true,
      pristine: {},
      required: {},
      values: {},
      errors: {}
    }

    const prevButton = button({
      onClick: (e) => {
        e.preventDefault()

        onPrev()

        return false
      },
      type: 'button',
      text: 'Back',
      size: 'none'
    })

    const nextButton = new Button('payment-button', state, emit)

    return html`
      <form novalidate onsubmit=${(e) => {
        e.preventDefault()

        this.validator.validate('name', this.form.values.name)

        morph(this.element.querySelector('.name-input'), renderNameInput())

        if (this.form.valid) {
          nextButton.disable('Please wait...')

          onSubmit(e, {
            element: this.cardNumberElement,
            formData: {
              name: this.form.values.name
            }
          })
        } else {
          console.log('Form is not valid')
        }
      }}>
        <div class="flex flex-column">
          ${renderNameInput()}
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
          ${nextButton.render({
            type: 'submit',
            disabled: false,
            size: 'none',
            text: 'Next'
          })}
        </div>
      </form>
    `

    function renderNameInput () {
      const pristine = self.form.pristine
      const errors = self.form.errors
      const values = self.form.values

      const nameInput = input({
        type: 'text',
        name: 'name',
        invalid: errors.name && !pristine.name,
        theme: 'dark',
        placeholder: 'Name on card',
        value: values.name,
        onchange: (e) => {
          self.validator.validate(e.target.name, e.target.value)

          morph(self.element.querySelector('.name-input'), renderNameInput())
        }
      })

      return html`
        <div class="name-input mb1">
          ${nameInput}
          ${errors.name && !pristine.name ? html`<span class="message warning pb2">${errors.name.message}</span>` : ''}
        </div>
      `
    }
  }

  unload () {
    this.reset()
    this.cardNumberElement.unmount()
    this.cardExpiryElement.unmount()
    this.cardCvcElement.unmount()
  }

  reset () {
    this.validator = validateFormdata()
    this.form = this.validator.state
  }

  load () {
    const elements = this.state.stripe.elements({
      fonts: [
        {
          cssSrc: 'https://static.resonate.is/css/fonts.css'
        }
      ]
    })

    const style = {
      base: {
        iconColor: '#fff',
        color: '#fff',
        lineHeight: '1rem',
        fontWeight: 400,
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

    this.cardExpiryElement = elements.create('cardExpiry', { style: placeholderStyle, placeholder: '     /' })

    this.cardExpiryElement.addEventListener('change', function (event) {
      const displayError = document.getElementById('cardExpiryError')

      if (event.error) {
        displayError.textContent = event.error.message
      } else {
        displayError.textContent = ''
      }
    })

    this.cardExpiryElement.mount('#cardExpiry')

    this.cardCvcElement = elements.create('cardCvc', { style, placeholder: '' })
    this.cardCvcElement.addEventListener('change', function (event) {
      const displayError = document.getElementById('cardCvcError')

      if (event.error) {
        displayError.textContent = event.error.message
      } else {
        displayError.textContent = ''
      }
    })
    this.cardCvcElement.mount('#cardCvc')

    this.validator.field('name', (data) => {
      if (isEmpty(data)) return new Error('Card name is required')
    })
  }

  update () {
    return false
  }
}

module.exports = PaymentMethods
