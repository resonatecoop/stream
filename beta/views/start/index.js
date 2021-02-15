const html = require('choo/html')
const viewLayout = require('../../layouts/start')
const icon = require('@resonate/icon-element')
const { isNode } = require('browser-or-node')
const Component = require('choo/component')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const ASSETS_PATH = 'https://static.resonate.is/pwa_assets'

/**
 * Display random logo on load
 * Iterate over possible background positions on click/right click
 */

class RandomLogo extends Component {
  constructor (id, state, emit) {
    super(id)

    this.local = state.components[id] = {}

    this.local.positions = [
      0,
      12.5,
      25,
      37.5,
      50,
      62.5,
      75,
      87.5,
      100
    ]

    this.local.current = 0
    this.local.pos = this.local.positions[this.local.current]
  }

  createElement () {
    const attrs = {
      oncontextmenu: e => {
        e.preventDefault()
        const img = this.element.querySelector('.random-logo')
        this.local.current = this.local.current - 1
        if (this.local.current < 0) {
          this.local.current = 8
        }
        this.local.pos = this.local.positions[this.local.current]

        img.style.backgroundPosition = `0 ${this.local.pos}%`
        return false
      },
      onclick: e => {
        const img = this.element.querySelector('.random-logo')
        this.local.current = this.local.current + 1
        if (this.local.current === this.local.positions.length) {
          this.local.current = 0
        }
        this.local.pos = this.local.positions[this.local.current]

        img.style.backgroundPosition = `0 ${this.local.pos}%`
      },
      class: 'grow ma0 db aspect-ratio aspect-ratio--1x1 invert--dark'
    }

    const src = isNode ? (ASSETS_PATH + '/sprite_optimized.png') : imagePlaceholder(2048, 2048)

    const style = `background-position:0 ${this.local.pos}%;background-repeat:no-repeat;background-image:url(${src});`

    return html`
      <div class="fl w-100 pa4">
        <figure ${attrs}>
          <span role="img" class="aspect-ratio--object cover random-logo" style=${style}></span>
          <figcaption class="clip">Resonate Coop Logo</figcaption>
        </figure>
      </div>
    `
  }

  load (el) {
    const img = this.element.querySelector('.random-logo')

    this.local.current = Math.floor(Math.random() * this.local.positions.length - 1) // random index position
    this.local.pos = this.local.positions[this.local.current]

    img.style.backgroundPosition = `0 ${this.local.pos}%`
    img.style.backgroundImage = 'url(https://static.resonate.is/pwa_assets/sprite_optimized.png)'
  }

  update () {
    return false
  }
}

module.exports = () => viewLayout(renderStart)

function renderStart (state, emit) {
  return html`
    <div class="flex flex-column flex-auto w-100">
      ${renderHero(state, emit)}
      ${renderList(state, emit)}
      ${renderCta()}
    </div>
  `
}

function renderHero (state, emit) {
  return html`
    <section id="welcome" class="flex flex-column flex-auto relative mb4">
      <article class="flex items-center flex-auto w-100 flex-column flex-row-l mb6">
        <div class="pa0-l w-100 w-40-ns">
          ${state.cache(RandomLogo, 'random-logo', state, emit).render()}
        </div>
        <div class="flex flex-auto items-center items-start-ns flex-column w-100 w-60-l ph4 ph0-l">
          <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l pr4-ns">
            A music streaming platform owned and run by its members – artists, labels, listeners, and builders.
          </p>
          <div class="flex flex-auto items-center items-start-ns flex-column flex-row-ns mt4 mt0-ns">
            <a href="https://resonate.is/join" target="_blank" rel="noopener noreferer" class="db dim ttu w-100 w-auto-ns tc b link pv3 mr2-ns ph3 ph4-l ba bw1">
              Become a member
            </a>
            <a href="/login" class="db dim b tc link w-100 w-auto-ns mt4 mt0-ns pv3 ph3 ph4-l">Login to the player</a>
          </div>
        </div>
      </article>
      <div class="absolute flex bottom-0" style="left:50%;transform-origin:bottom;transform:translateY(-50%) rotate(-90deg);">
        ${icon('arrow', { size: 'md' })}
      </div>
    </section>
  `
}

function renderList () {
  const list = [
    {
      src: ASSETS_PATH + '/landing-page/music-ecosystem-transparent_optimized.png',
      altText: 'Discovery',
      title: 'Discovery',
      text: [
        'Discover new sounds and genres from artists all over the world.'
      ]
    },
    {
      src: ASSETS_PATH + '/landing-page/ethicalstreaming-transparent_optimized.png',
      altText: 'Fair Play',
      title: 'Fair Play',
      text: [
        'Directly support the artists that you love with our ‘stream2own’ pricing and reward model.'
      ]
    },
    {
      src: ASSETS_PATH + '/landing-page/wallet_transparent_optimized.png',
      altText: 'Ownership',
      title: 'Ownership',
      text: [
        'Co-own your platform and become a part of an active community where you share in decisions and profits by becoming a Resonate cooperative member.'
      ]
    },
    {
      src: ASSETS_PATH + '/landing-page/privacy_transparent_optimized.png',
      altText: 'Privacy',
      title: 'Privacy',
      text: [
        'We play fair with your information too.',
        'We ask only for what we need, to provide a trusted community streaming platform.',
        'We don’t sell you to anyone.',
        'You control what you share.'
      ]
    }
  ]

  return html`
    <section id="new-player" class="flex flex-column flex-auto mb6">
      <div class="flex flex-column flex-row-l flex-auto w-100">
        <div class="flex flex-column flex-auto w-100">
          ${list.map(({ src, title, text = [], altText }) => {
            return html`
              <article class="flex flex-column flex-row-ns justify-center items-center ph4 ph5-l pb6">
                <div class="w-100 w-60-ns">
                  <dl class="flex flex-column">
                    <dt class="lh-title f3 f2-l f2-vw f3-vw-m f4-vw-l b mb2">${title}</dt>
                    ${text.map(item => {
                      return html`
                        <dd class="ma0 lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
                          ${item}
                        </dd>
                      `
                    })}
                  </dl>
                </div>
                <div class="fl w-100 w-40-ns">
                  <div class="db aspect-ratio aspect-ratio--1x1">
                    <figure class="ma0">
                      <picture>
                        <source srcset=${src.replace('.png', '.webp')} type="image/webp">
                        <source srcset=${src} type="image/png">
                        <img src=${src} width=400 height=400 class="aspect-ratio--object z-1 invert--dark">
                      </picture>
                      <figcaption class="clip">${altText}</figcaption>
                    </figure>
                  </div>
                </div>
              </article>
            `
          })}
        </div>
      </div>
      <div class="flex justify-end ph4 mr6">
        <dl class="flex f5 lh-copy">
          <dt>artwork by</dt>
          <dd class="ml1 b bb bw1 b--gray">
            <a class="link" target="_blank" rel="noopener noreferer" href="https://www.bridget-m.com/">Bridget M</a>
          </dd>
        </dl>
      </div>
    </section>
  `
}

function renderCta () {
  return html`
    <section id="listening-now" class="flex flex-auto flex-column flex-row-l mb5">
      <div class="flex flex-auto items-center justify-center flex-column w-100">
        <h2 class="lh-title fw1 f4 ma0 mb4 tc">Create an account, and get .128 Resonate credits (about 4 hours of listening) FREE!</h2>
        <div class="flex flex-auto flex-column flex-row-ns">
          <div class="mr3-ns mb3 mb0-ns">
            <a href="https://resonate.is/join" target="_blank" rel="noopener noreferer" class="db ttu b tc link pv3 ph4 ba bw1">Create an account</a>
          </div>
          <div>
            <a href="/login" class="db b tc link pv3 ph4">Login to the player</a>
          </div>
        </div>
      </div>
    </section>
  `
}
