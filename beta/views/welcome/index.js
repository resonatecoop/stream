const html = require('choo/html')
const ThemeSwitcher = require('../../components/theme-switcher')
const {
  foreground: fg
} = require('@resonate/theme-skins')

module.exports = WelcomeView

function WelcomeView () {
  return (state, emit) => {
    return html`
      <section class="flex flex-auto flex-column w-100 pb6">
        <section id="theme" class="${fg}">
          <h2 class="lh-title fw1">Theme</h2>
          ${state.cache(ThemeSwitcher, 'theme-switcher').render()}
        </section>
      </section>
    `
  }
}
