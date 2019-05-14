const Nanocomponent = require('nanocomponent')
const button = require('@resonate/button')

/**
 * <button> element wrapper
 */

class ButtonComponent extends Nanocomponent {
  constructor (name) {
    super(name)

    this.disabled = false

    this.disable = this.disable.bind(this)
  }

  createElement (props) {
    if (typeof props.onClick === 'function') {
      props.onClick = props.onClick.bind(this)
    }

    return button(Object.assign(props, { disabled: this.disabled }))
  }

  disable () {
    this.disabled = true
    if (this.element) this.rerender()
  }

  update (props) {
    return props.disabled !== this.disabled
  }
}

module.exports = ButtonComponent
