const html = require('nanohtml')

module.exports = props => {
  const {
    prefix = 'link db dim pv2 ph2 w-100', // sheetify prefix or class list
    href = '',
    target = '_self',
    rel,
    title = '',
    text
  } = props

  return html`
    <a
      class=${prefix}
      href=${href}
      target=${target}
      rel=${rel || (props.target === '_blank' ? 'noopener' : '')}
      title=${title}
    >
      ${text}
    </a>
  `
}
