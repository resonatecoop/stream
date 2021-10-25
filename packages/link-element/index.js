const html = require('nanohtml')

module.exports = props => {
  const {
    prefix = 'link db dim pv2 ph2 w-100', // sheetify prefix or class list
    href = '',
    target,
    title,
    onClick,
    text
  } = props

  const attrs = {
    class: prefix,
    href: href
  }

  if (target) {
    attrs.target = target
  }

  if (target === '_blank') {
    attrs.rel = 'noopener noreferer'
  }

  if (onClick) {
    attrs.onclick = onClick
  }

  if (title) {
    attrs.title = title
  }

  return html`
    <a ${attrs}>${text}</a>
  `
}
