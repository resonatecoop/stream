const html = require('choo/html')
const noop = () => {}

module.exports = (props) => {
  const {
    classList = '', // extra classes
    autofocus = false,
    id = props.name || props.type,
    value = '',
    type,
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
      class="${classList} bg-black white placeholder--dark-gray bg-white--dark black--dark input-reset w-100 bn pa3 ${invalid ? 'invalid' : 'valid'}"
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
