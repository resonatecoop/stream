const icon = require('@resonate/icon-element')
const html = require('choo/html')

module.exports = message

function message (props) {
  const { type = 'info', message } = props
  const fillColor = type === 'error' ? 'fill-red' : 'fill-current-color'

  return html`
    <div class="flex flex-auto w-100 items-center justify-center">
      ${icon('info', { size: 'sm', class: fillColor })}
      <p class="pl3 ma0">${message}</p>
    </div>
  `
}
