const html = require('choo/html')
const subView = require('../../layouts/outside')
const Component = require('choo/component')

const ASSETS_PATH = process.env.ASSETS_PATH || ''

const SPRITES = [
  {
    src: ASSETS_PATH + '/Music-ecosystem-transparent.png',
    altText: 'Ecosystem of artists and labels',
    paragraphs: [
      html`
        <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
          <span class="b">Exploration.</span><br> Browse by labels, artists and genre with advanced search filters.
        </p>
      `
    ]
  },
  {
    src: ASSETS_PATH + '/Ethicalstreaming-transparent.png',
    altText: 'Ethical Streaming',
    paragraphs: [
      html`
        <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
          <span class="b">Built for the web and mobile.</span><br> Keep your music library synced with you at all time. No subscription or payment required.
        </p>
      `
    ]
  },
  {
    src: ASSETS_PATH + '/Privacy_transparent.png',
    altText: 'Privacy Respecting',
    paragraphs: [
      html`
        <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
          <span class="b">Analytics and historical play reports.</span><br> Take a peak on your listening habits and see how much money went to creators.
        </p>
      `
    ]
  },
  {
    src: ASSETS_PATH + '/Wallet_transparent.png',
    altText: 'Wallet',
    paragraphs: [
      html`
        <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
          <span class="b">No account sharing.</span><br> Simply distribute credits from one wallet to the other and share playlists.
        </p>
      `
    ]
  }
]

class Slider extends Component {
  constructor (id, state, emit) {
    super()

    this.state = state
    this.emit = emit

    this.local = state.components[id] = {}
  }

  createElement () {
    return html`
      <section class="flex flex-column flex-row-l flex-auto w-100">
        <div class="flex flex-column flex-auto w-100">
          ${SPRITES.map(({ src, paragraphs = [], altText }) => {
            return html`
              <article class="flex flex-column flex-row-ns justify-center items-center ph5 mb4">
                <div class="w-100">
                  ${paragraphs.map((p) => p)}
                </div>
                <div class="fl w-100">
                  <div class="db aspect-ratio aspect-ratio--1x1">
                    <figure class="ma0">
                      <picture>
                        <source srcset=${src.replace('.png', '.webp')} type="image/webp">
                        <source srcset=${src} type="image/png">
                        <img src=${src} width=400 height=400 class="aspect-ratio--object z-1 invert--dark" />
                      </picture>
                      <figcaption class="clip">${altText}</figcaption>
                    </figure>
                  </div>
                </div>
              </article>
            `
          })}
        </div>
      </section>
    `
  }

  update () {
    return false
  }
}

module.exports = WelcomeView

function WelcomeView () {
  return subView((state, emit) => {
    return state.cache(Slider, 'slider').render()
  })
}
