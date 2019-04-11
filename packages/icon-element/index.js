var html = require('nanohtml')
var assert = require('assert')

module.exports = iconElement

function iconElement (iconName, opts) {
  opts = opts || {}

  assert.strictEqual(typeof iconName, 'string', 'elements/icon: iconName should be type string')
  assert.strictEqual(typeof opts, 'object', 'elements/icon: opts should be type object')

  var classNames = 'icon-' + iconName
  if (opts.class) classNames += (' ' + opts.class)

  return html`
    <svg viewBox="0 0 16 16" class=${classNames}>
      <use xlink:href="#icon-${iconName}" />
    </svg>
  `
}
