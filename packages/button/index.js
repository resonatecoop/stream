const html = require('nanohtml')
const icon = require('@resonate/icon-element')
const { foreground } = require('@resonate/theme-skins')
const classNames = require('classnames')

function Button (props = {}) {
  const {
    prefix,
    type = 'button',
    disabled = false,
    iconName,
    iconSize = 'sm',
    justifyCenter = false,
    text
  } = props

  const style = {
    default: `${foreground} b--black ba bw b pv2 ph4`,
    blank: 'bg-transparent bn'
  }[props.style || 'default']

  const small = props.size === 'small'
  const medium = props.size === 'medium'

  const attrs = {
    onclick: props.onClick || props.onclick || null,
    type,
    disabled: disabled || false,
    class: classNames(prefix, style, {
      'flex-shrink-0': true,
      f5: !!text,
      grow: !disabled,
      'o-50': disabled,
      w2: small,
      h2: small,
      w3: medium,
      h3: medium
    })
  }

  if (props.value) {
    attrs.value = props.value
  }

  if (props.title) {
    attrs.title = props.title
  }

  const innerBtnClass = classNames('flex', 'items-center', { 'justify-center': (!!props.size && props.size !== 'none') || justifyCenter })

  return html`
    <button ${attrs}>
      ${iconName ? html`<div class=${innerBtnClass}>
        ${icon(iconName, { size: iconSize })}
        ${text ? html`<span class=${iconName ? 'pl2' : ''}>${text}</span>` : ''}
      </div>` : text}
    </button>
  `
}

module.exports = Button
