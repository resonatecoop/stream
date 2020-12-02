const { isBrowser } = require('browser-or-node')

module.exports = size => {
  if (!isBrowser) return true

  const breakpoint = {
    ns: 'screen and (min-width: 30em)',
    m: 'screen and (min-width: 30em) and (max-width: 60em)',
    l: 'screen and (min-width: 60em)'
  }[size]

  return window.matchMedia(breakpoint).matches
}
