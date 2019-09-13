const Nanocomponent = require('nanocomponent')
const button = require('@resonate/button')

/**
 * <button> element wrapper
 */

class ButtonComponent extends Nanocomponent {
  constructor (name) {
    super(name)

    this.local = {}
    this.local.disabled = false

    this.disable = this.disable.bind(this)
  }

  createElement (props) {
    if (typeof props.onClick === 'function') {
      props.onClick = props.onClick.bind(this)
    }

    return button(Object.assign(props, { disabled: this.local.disabled, text: this.local.text || props.text }))
  }

  disable (text) {
    this.local.disabled = true
    this.local.text = text

    if (this.element) {
      this.rerender()
    }
  }

  update (props) {
    return props.disabled !== this.local.disabled
  }
}

module.exports = ButtonComponent
