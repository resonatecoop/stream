import icon from '@resonate/icon-element'
import { background as bg } from '@resonate/theme-skins'
import classNames from 'classnames'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('nanohtml')

interface ButtonProps {
  prefix?: string
  type?: string
  disabled?: boolean
  theme?: string
  iconName?: string
  iconSize?: string
  justifyCenter?: boolean
  text?: string
  style?: 'default' | 'blank'
  size?: string
  outline?: boolean
  title?: string
  value?: string
  onClick?: HTMLButtonElement['onclick']
  onclick?: HTMLButtonElement['onclick']
}

function Button (props: ButtonProps = {}): HTMLElement {
  const {
    prefix,
    type = 'button',
    disabled = false,
    theme,
    iconName,
    iconSize = 'sm',
    justifyCenter = false,
    text
  } = props

  const style = {
    default: theme === 'light' ? 'bg-white black' : theme === 'dark' ? 'bg-black white' : bg,
    blank: 'bg-transparent bn'
  }[props.style ?? 'default']

  const size = props.size ?? 'none'

  const paddings = size === 'none' ? 'pv2 ph4' : ''

  const attrs: any = {
    onclick: props.onClick ?? props.onclick ?? null,
    type,
    disabled: disabled || false,
    class: classNames(prefix, paddings, style, {
      bn: true,
      b: true,
      'flex-shrink-0': true,
      f5: !!text,
      grow: !disabled,
      'o-50': disabled,
      w2: size.startsWith('s'),
      h2: size.startsWith('s'),
      w3: size.startsWith('m'),
      h3: size.startsWith('m')
    })
  }

  if (props.outline) {
    attrs.style = 'outline:solid 1px var(--near-black);outline-offset:-1px' // use outline instead of border as a workaround to have clean scale on hover and focus
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
      ${iconName
        ? html`
          <div class=${innerBtnClass}>
            ${icon(iconName, { size: iconSize })}
            ${text ? html`<span class=${iconName ? 'pl2' : ''}>${text}</span>` : ''}
          </div>`
      : text}
    </button>
  `
}

export = Button
