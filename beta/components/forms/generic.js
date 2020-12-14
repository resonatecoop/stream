const html = require('choo/html')
const Component = require('choo/component')
const inputEl = require('@resonate/input-element')
const button = require('@resonate/button')
const icon = require('@resonate/icon-element')

class Form extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = {}
  }

  createElement (props) {
    this.local.fields = props.fields
    this.local.buttonText = props.buttonText || ''
    this.local.id = props.id
    this.local.action = props.action
    this.local.method = props.method || 'POST'
    this.local.form = props.form

    this.submit = props.submit
    this.validate = props.validate

    const pristine = this.local.form.pristine
    const errors = this.local.form.errors
    const values = this.local.form.values

    const inputs = this.local.fields.map(fieldProps => {
      const { name = fieldProps.type, help } = fieldProps
      const props = Object.assign(fieldProps, {
        onchange: (e) => {
          this.validate({ name: e.target.name, value: e.target.value })
          this.rerender()
        }
      })

      const info = html`
        <div class="absolute left-0 ph1 flex items-center" style="top:50%;transform: translate(-100%, -50%);">
          ${icon('info', { class: 'fill-red', size: 'sm' })}
        </div>
      `

      return html`
        <div class="flex flex-column mb3">
          <div class="relative">
            ${inputEl(Object.assign(props, { value: values[name] }))}
            ${errors[name] && !pristine[name] ? info : ''}
          </div>
          ${errors[name] && !pristine[name] ? html`<span class="message warning pb2">${errors[name].message}</span>` : ''}
          ${help}
        </div>
      `
    })

    const attrs = {
      novalidate: 'novalidate',
      class: 'flex flex-column flex-auto ma0 pa0',
      id: this.local.id,
      action: this.local.action,
      method: this.local.method,
      onsubmit: e => {
        e.preventDefault()

        for (const field of e.target.elements) {
          const isRequired = field.required
          const name = field.name || ''
          const value = field.value || ''
          if (isRequired) this.validate({ name, value })
        }

        this.rerender()

        if (this.local.form.valid) {
          this.submit(e.target)
        }
      }
    }

    return html`
      <form ${attrs}>
        ${inputs}
        <div class="mt3">
          ${button({ type: 'submit', outline: true, text: this.local.buttonText })}
        </div>
      </form>
    `
  }

  update () {
    return false
  }
}

module.exports = Form
