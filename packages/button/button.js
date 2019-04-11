const html = require('nanohtml')
const icon = require('icon-element')
const { iconFill: defaultIconFill, foreground } = require('@resonate/theme-skins')

function Button (props) {
  const {
    value = '',
    prefix, // prefix for tachyons or class name list
    type = 'button',
    iconName,
    iconFill = defaultIconFill,
    iconSize = 'sm',
    onClick: clickHandler = () => {},
    text
  } = props

  const style = {
    'default': `${foreground} flex-shrink-0 b--black ba bw b grow pv2 ph4 f5`,
    'blank': 'bg-transparent grow flex-shrink-0 bn f5',
    'none': ''
  }[props.style || 'default']

  const size = {
    'none': '',
    'square': 'h3 w3'
  }[props.size || 'square']

  const classList = [style, size, prefix]
    .filter(Boolean)
    .join(' ')

  return html`
    <button
      value=${value}
      type=${type}
      class=${classList}
      onclick=${clickHandler}>
        <div class="flex items-center ${!text ? 'justify-center' : ''}">
          ${iconName ? icon(iconName, { 'class': `icon icon--${iconSize} ${iconFill}` }) : ''}
          ${text ? html`<span class=${iconName ? 'pl2' : ''}>${text}</span>` : ''}
        </div>
    </button>
  `
}

module.exports = Button
