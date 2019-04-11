const html = require('nanohtml')
const noop = () => {}
const { foreground } = require('@resonate/theme-skins')

/**
 * Render <input/> element
 */

const inputEl = (props) => {
  const {
    classList = '', // extra classes
    autofocus = false,
    id = props.name || props.type,
    value = '',
    type = 'text',
    min = 0,
    max = '',
    invalid = false,
    name = props.type,
    onchange = noop,
    onKeyPress = noop,
    onInput = noop,
    onKeyUp = noop,
    onKeyDown = noop,
    placeholder = '',
    autocomplete = false,
    required = 'required'
  } = props

  return html`
    <input
      autofocus=${autofocus}
      class="${classList} ${foreground} placeholder--dark-gray input-reset w-100 bn pa3 ${invalid ? 'invalid' : 'valid'}"
      value=${value}
      onkeyup=${onKeyUp}
      onkeypress=${onKeyPress}
      onkeydown=${onKeyDown}
      oninput=${onInput}
      onchange=${onchange}
      autocomplete=${autocomplete}
      minlength=${min}
      maxlength=${max}
      id=${id}
      type=${type}
      name=${name}
      placeholder=${placeholder}
      required=${required}
    >
  `
}

module.exports = inputEl
