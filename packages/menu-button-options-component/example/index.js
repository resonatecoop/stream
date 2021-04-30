const choo = require('choo')
const html = require('choo/html')
const app = choo()
const ShareMenuButton = require('../')

app.use((state, emitter) => {
  emitter.on('clipboard', () => {
    // copy to clipboard
  })
})

app.use((state, emitter) => {
  emitter.on(state.events.DOMCONTENTLOADED, () => {
    window.addEventListener('keydown', handleFirstTab)
  })

  function handleFirstTab (e) {
    if (e.keyCode === 9) {
      document.body.classList.add('user-is-tabbing')

      window.removeEventListener('keydown', handleFirstTab)
      window.addEventListener('mousedown', handleMouseDownOnce)
    }
  }

  function handleMouseDownOnce () {
    document.body.classList.remove('user-is-tabbing')
    window.removeEventListener('mousedown', handleMouseDownOnce)
    window.addEventListener('keydown', handleFirstTab)
  }
})

app.route('*', (state, emit) => html`
  <div id="app">
    <div class="flex justify-end pr3">
      ${state.cache(ShareMenuButton, 'my-share-menu-button').render({
        items: [
          {
            iconName: 'logo',
            text: 'My custom button',
            actionName: 'custom',
            updateLastAction: data => {
              // does nothing
            }
          }
        ], // custom items
        selection: ['webshare', 'profile', 'buy', 'download'], // order should be important
        orientation: 'bottomright', // menu button orientation
        data: {
          count: 9,
          url: 'https://beta.stream.resonate.coop/artist/1056',
          cover: 'https://static.resonate.is/track-artwork/600x600/098bd10e-c4e2-4824-ac73-8b5efbe440f5',
          creator_id: 1056,
          id: 144
        }
      })}
    </div>
  </div>
`)

module.exports = app.mount('#app')
