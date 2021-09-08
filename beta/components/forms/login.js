const html = require('choo/html')
const Component = require('choo/component')
const nanostate = require('nanostate')
const Form = require('./generic')
const isEmail = require('validator/lib/isEmail')
const isEmpty = require('validator/lib/isEmpty')
const validateFormdata = require('validate-formdata')
const nanologger = require('nanologger')
const log = nanologger('login')

class Login extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = {}

    this.local.machine = nanostate('idle', {
      idle: { start: 'loading' },
      loading: { resolve: 'idle', reject: 'error' },
      error: { start: 'loading' }
    })

    this.local.machine.on('loading', () => {
      this.rerender()
    })

    this.local.machine.on('error', () => {
      this.rerender()
    })

    this.sendRequest = this.sendRequest.bind(this)
    this.reset = this.reset.bind(this)

    this.validator = validateFormdata()
    this.form = this.validator.state
  }

  createElement () {
    const message = {
      loading: html`<p class="status bg-gray bg--mid-gray--dark black w-100 pa2">La patience est une vertu...</p>`,
      error: html`<p class="status bg-gray bg--mid-gray--dark black w-100 pa2">Wrong email or password</p>`
    }[this.local.machine.state]

    const form = this.state.cache(Form, 'login-form').render({
      id: 'login',
      method: 'POST',
      action: '/login',
      validate: (props) => {
        this.validator.validate(props.name, props.value)
        this.rerender()
      },
      form: this.form || {
        changed: false,
        valid: true,
        pristine: {},
        required: {},
        values: {},
        errors: {}
      },
      buttonText: 'Log In',
      fields: [
        { type: 'email', autofocus: true, placeholder: 'Email' },
        {
          type: 'password',
          placeholder: 'Password',
          help: html`
            <div class="flex justify-end">
              <a href="https://resonate.is/password-reset/" class="lightGrey f7 ma0 pt1 pr2" target="_blank" rel="noopener noreferer">
                Forgot your password?
              </a>
            </div>
          `
        }
      ],
      submit: (data) => {
        const username = data.email.value // username is an email
        const password = data.password.value
        this.sendRequest(username, password)
      }
    })

    return html`
      <div class="flex flex-column flex-auto">
        ${message}
        ${form}
      </div>
    `
  }

  async sendRequest (username, password) {
    this.local.machine.emit('start')

    try {
      const response = await this.state.api.auth.login({
        username,
        password
      })

      if (!response.data) {
        this.local.machine.emit('reject')
      } else {
        const { access_token: token, client_id: clientId, user } = response.data

        // now call oauth v1 api to set cookie
        await this.state.api.auth.tokens({ access_token: token })

        // will call user profile on v2 api
        this.emit('auth', { token, clientId, user })

        this.local.machine.emit('resolve')

        this.reset()

        this.emit('redirect', {
          dest: this.state.redirect || '/discover',
          silent: true,
          update: true
        })

        delete this.state.redirect
      }
    } catch (err) {
      log.error(err)
      this.local.machine.emit('reject')
    }
  }

  unload () {
    this.reset()
  }

  reset () {
    this.validator = validateFormdata()
    this.form = this.validator.state
  }

  load () {
    this.validator.field('email', data => {
      if (isEmpty(data)) return new Error('Email is required')
      if (!(isEmail(data))) return new Error('Email is not valid')
    })

    this.validator.field('password', data => {
      if (isEmpty(data)) return new Error('Password is required')
    })
  }

  update () {
    return false
  }
}

module.exports = Login
