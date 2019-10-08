const html = require('nanohtml')
const assert = require('assert')
const classNames = require('classnames')

module.exports = iconElement

function iconElement (iconName, opts = {}) {
  assert.strictEqual(typeof iconName, 'string', 'elements/icon: iconName should be type string')
  assert.strictEqual(typeof opts, 'object', 'elements/icon: opts should be type object')

  const iconSize = opts.size || 'sm'

  const classes = classNames({
    icon: true,
    [`icon-${iconName}`]: true,
    [`icon--${iconSize}`]: true
  }, opts.class)

  const scaleY = 1
  let scaleX = 1

  if (opts.flip) {
    scaleX = -1
  }

  return html`
    <svg viewBox="0 0 16 16" class=${classes} transform="scale(${scaleX}, ${scaleY})">
      <use xlink:href="#icon-${iconName}" />
    </svg>
  `
}
