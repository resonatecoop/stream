const html = require('choo/html')
const { iconFill } = require('@resonate/theme-skins')
const icon = require('@resonate/icon-element')

module.exports = (props) => {
  const { href, text } = props

  return html`
    <div class="breadcrumb mv3">
      <a class="link flex items-center f5 dim" href=${href}>
        ${icon('arrow', { class: iconFill, size: 'sm' })}
        <span class="b pl2">${text}</span>
      </a>
    </div>
  `
}
