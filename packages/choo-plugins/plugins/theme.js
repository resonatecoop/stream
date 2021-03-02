/* global localStorage */

const { isBrowser } = require('browser-or-node')

module.exports = theme

function theme (options = {}) {
  return (state, emitter) => {
    if (isBrowser) {
      const theme = (localStorage !== null && localStorage.getItem('color-scheme')) || 'light'
      document.body.classList.add(`color-scheme--${theme}`)
      state.theme = theme
    } else {
      state.theme = 'light'
    }

    emitter.on('theme', (props) => {
      const { theme = 'light', auto = false } = props

      if (!auto) {
        document.body.classList.toggle('color-scheme--light', theme === 'light')
        document.body.classList.toggle('color-scheme--dark', theme === 'dark')

        state.theme = theme

        window.localStorage.setItem('color-scheme', theme)
        window.localStorage.removeItem('color-scheme-auto')

        return
      }

      document.body.classList.remove('color-scheme--light')
      document.body.classList.remove('color-scheme--dark')

      state.theme = 'light'

      window.localStorage.removeItem('color-scheme')
      window.localStorage.setItem('color-scheme-auto', true)
    })
  }
}
