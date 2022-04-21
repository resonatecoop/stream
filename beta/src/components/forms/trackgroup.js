const html = require('choo/html')
const Component = require('choo/component')
const input = require('@resonate/input-element')
const button = require('@resonate/button')
const messages = require('./messages')
const isEqual = require('is-equal-shallow')
const logger = require('nanologger')
const log = logger('form:trackgroups:update')
const inputField = require('../../elements/input-field')
const textarea = require('@resonate/textarea-element')

const isEmpty = require('validator/lib/isEmpty')
const isLength = require('validator/lib/isLength')
const validateFormdata = require('validate-formdata')
const nanostate = require('nanostate')

const { getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST,
  base: process.env.API_BASE || '/api/v3'
})

/**
 * Trackgroup form for playlist update
 */

class TrackgroupForm extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = Object.create({
      machine: nanostate.parallel({
        form: nanostate('idle', {
          idle: { submit: 'submitted' },
          submitted: { valid: 'data', invalid: 'error' },
          data: { reset: 'idle', submit: 'submitted' },
          error: { reset: 'idle', submit: 'submitted', invalid: 'error' }
        }),
        request: nanostate('idle', {
          idle: { start: 'loading' },
          loading: { resolve: 'data', reject: 'error' },
          data: { start: 'loading' },
          error: { start: 'loading', stop: 'idle' }
        })
      })
    })

    this.local.data = {
      private: true,
      type: 'playlist'
    }
    this.local.machine.on('form:reset', () => {
      log.info('form reset')
      this.validator = validateFormdata()
      this.local.form = this.validator.state
    })

    this.local.machine.on('request:start', () => {

    })

    this.local.machine.on('request:resolve', () => {
    })

    this.local.machine.on('form:valid', async () => {
      log.info('Form is valid')

      this.emit('notify', { message: 'Updating...' })

      try {
        this.local.machine.emit('request:start')

        const getClient = getAPIServiceClientWithAuth(this.state.user.token)
        const client = await getClient('trackgroups')
        const result = await client.updateTrackgroup({
          id: this.local.data.id,
          trackgroup: {
            cover: this.local.data.cover_metadata.id,
            private: this.local.data.private,
            type: 'playlist',
            title: this.local.data.title,
            about: this.local.data.about,
            tags: this.local.data.tags
          }
        })

        const { body: response } = result

        if (response.data) {
          this.emit('notify', { message: 'Update was successfull' })

          this.local.data = response.data

          this.local.machine.emit('request:resolve')
        }
      } catch (err) {
        this.local.machine.emit('request:reject')
        this.emit('error', err)
      }
    })

    this.local.machine.on('form:invalid', () => {
      this.emit('notify', { message: 'Form has errors' })

      this.rerender()

      log.info('Form is invalid')

      const invalidInput = document.querySelector('.invalid')

      if (invalidInput) {
        invalidInput.focus({ preventScroll: false }) // focus to first invalid input
      }
    })

    this.local.machine.on('form:submit', () => {
      log.info('Form has been submitted')

      const form = this.element.querySelector('form')

      for (const field of form.elements) {
        const isRequired = field.required
        const name = field.name || ''
        const value = field.value || ''

        if (isRequired) {
          log.info(`validating ${name}:${value}`)
          this.validator.validate(name, value)
        }
      }

      this.rerender()

      if (this.local.form.valid) {
        return this.local.machine.emit('form:valid')
      }

      return this.local.machine.emit('form:invalid')
    })

    this.validator = validateFormdata()
    this.local.form = this.validator.state

    const pristine = this.local.form.pristine
    const errors = this.local.form.errors
    const values = this.local.form.values

    // inputs
    this.elements = {
      title: () => {
        const el = input({
          type: 'text',
          name: 'title',
          invalid: errors.title && !pristine.title,
          value: values.title,
          onchange: (e) => {
            this.validator.validate(e.target.name, e.target.value)
            this.local.data[e.target.name] = e.target.value
            this.rerender()
          }
        })

        const labelOpts = {
          labelText: 'Playlist title',
          inputName: 'title',
          helpText: 'The name of this playlist as you want it to appear publicly.',
          displayErrors: true
        }

        return inputField(el, this.local.form)(labelOpts)
      },
      about: () => {
        const el = textarea({
          name: 'about',
          invalid: errors.about && !pristine.about,
          text: values.about,
          required: false,
          onchange: (e) => {
            this.validator.validate(e.target.name, e.target.value)
            this.local.data[e.target.name] = e.target.value
            this.rerender()
          }
        })

        const labelOpts = {
          labelText: 'Story',
          inputName: 'about',
          helpText: 'Tell us a bit about this playlist.',
          displayErrors: true
        }

        return inputField(el, this.local.form)(labelOpts)
      },
      tags: () => {
        const el = textarea({
          name: 'tags',
          invalid: errors.tags && !pristine.tags,
          text: values.tags ? values.tags.toString() : values.tags,
          required: false,
          onchange: (e) => {
            this.validator.validate(e.target.name, e.target.value)
            this.local.data[e.target.name] = e.target.value.split(',')
            this.rerender()
          }
        })

        const labelOpts = {
          labelText: 'Tags',
          inputName: 'tags',
          helpText: 'Comma-separated tags.',
          displayErrors: true
        }

        return inputField(el, this.local.form)(labelOpts)
      },
      private: () => {
        const attrs = {
          checked: this.local.data.private ? 'checked' : false,
          id: 'private',
          onchange: async (e) => {
            this.local.private = e.target.checked ? 'on' : false
            this.local.data.private = !!e.target.checked

            this.rerender()

            try {
              const getClient = getAPIServiceClientWithAuth(this.state.user.token)
              const client = await getClient('trackgroups')

              await client.updateTrackgroupPrivacy({
                id: this.local.data.id, // trackgroup id
                trackgroupPrivacy: {
                  private: this.local.data.private
                }
              })

              this.emit('notify', {
                message: `Your playlist is now ${this.local.data.private ? 'private' : 'public'}.`
              })
            } catch (err) {
              this.emit('error', err)
            }
          },
          value: values.private,
          class: 'o-0',
          style: 'width:0;height:0;',
          name: 'private',
          type: 'checkbox',
          required: 'required'
        }

        return inputField(html`<input ${attrs}>`, this.local.form)({
          prefix: 'flex flex-column mb5',
          labelText: 'Private',
          labelIconName: 'check',
          helpText: 'Make this playlist public or private.',
          inputName: 'private',
          displayErrors: true
        })
      }
    }
  }

  createElement (props = {}) {
    this.local.kind = props.kind
    const values = this.local.form.values

    for (const [key, value] of Object.entries(this.local.data)) {
      values[key] = value
    }

    return html`
      <div class="flex flex-column pb6">
        <h2 class="lh-title f3 normal mt0">${this.local.title}</h2>
        ${messages(this.local.form)}

        <form novalidate onsubmit=${(e) => {
          e.preventDefault()

          if (!this.local.form.changed) {
            return this.emit('notify', { message: 'Nothing to save' })
          }

          this.local.machine.emit('form:submit')
        }}>
          ${Object.entries(this.elements)
            .map(([name, el]) => el())}

          ${button({
            type: 'submit',
            outline: true,
            text: 'Save'
          })}
        </form>
      </div>
    `
  }

  load () {
    this.validator.field('about', { required: false }, (data) => {
      if (!isLength(data, { min: 0, max: 1000 })) {
        return new Error('Story should be no more than 200 characters')
      }
    })
    this.validator.field('title', (data) => {
      if (isEmpty(data)) return new Error('Title is required')
    })
    this.validator.field('private', { required: false })
    this.validator.field('tags', { required: false }, (data) => {
      if (!isLength(data, { min: 0, max: 10 })) {
        return new Error('Please add fewer than 11 tags')
      }
    })
  }

  unload () {
    if (this.local.machine.state.form !== 'idle') {
      this.local.machine.emit('form:reset')
    }
  }

  update (props) {
    if (!isEqual(props.data, this.local.data)) {
      // remove any null values
      this.local.data = Object.fromEntries(
        Object.entries(props.data)
          .filter(([key, value]) => Boolean(value))
      )
      this.rerender()
    }
    return false
  }
}

module.exports = TrackgroupForm
