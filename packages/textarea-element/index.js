const html = require('nanohtml')

module.exports = (props) => {
  const {
    text,
    invalid = false,
    maxlength = 200,
    autofocus = false,
    id = props.name || props.type, name,
    onchange = null,
    placeholder,
    autocomplete = false,
    required = 'required'
  } = props

  const attrs = {
    maxlength: maxlength,
    autofocus: autofocus,
    class: `w-100 db bn bg-black white pa2 ma0 ba bw1 ${invalid ? 'invalid' : 'valid'}`,
    onchange: onchange,
    autocomplete: autocomplete,
    id: id,
    name: name,
    placeholder: placeholder,
    required: !!required
  }

  return html`<textarea ${attrs}>${text}</textarea>`
}
