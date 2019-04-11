const Nanocomponent = require('nanocomponent')
const nanostate = require('nanostate')
const animation = require('nanoanimation')
const html = require('nanohtml')

/* global fetch, Request, URL */

class Artwork extends Nanocomponent {
  constructor (name) {
    super(name)

    this.machine = nanostate('idle', {
      idle: { 'load': 'loading' },
      loading: { 'resolve': 'data', 'reject': 'error' },
      data: { 'resolve': 'loading' },
      error: { 'resolve': 'idle' }
    })

    this.machine.on('data', () => {
      if (this.element) this.rerender()
    })

    this.renderArtwork = this.renderArtwork.bind(this)
  }

  createElement (props) {
    this.url = props.url
    this.animate = props.animate
    this.size = props.size || 'cover'
    this.position = props.position || 'center center'
    this.style = props.style || {}
    this.loaded = false
    this.fallback = props.fallback

    const artwork = {
      'loading': void 0,
      'data': this.renderArtwork()
    }[this.machine.state]

    return html`
      <div>
        ${artwork}
      </div>
    `
  }

  renderArtwork () {
    const el = html`
      <img class="db" width=100% decoding="auto" src=${this.url}">
    `

    for (let [key, value] of Object.entries(this.style)) {
      el.style[key] = value
    }

    if (this.animate) {
      animation([
        { opacity: 0 },
        { opacity: 1 }
      ], {
        duration: 300,
        fill: 'forwards'
      })(el).play()
    }

    return el
  }

  load (el) {
    if (this.machine.state !== 'loading') {
      this.machine.emit('load')
    }

    if (this.url) {
      const request = new Request(this.url)

      fetch(request, { cache: 'no-cache' }).then(response => {
        return response.blob()
      }).then(blob => {
        const objectURL = URL.createObjectURL(blob)
        this.url = objectURL
        this.machine.emit('resolve')
      }).catch(err => {
        if (err) { console.log(err) }
        this.machine.emit('reject')
      }).finally(() => {
        this.machine.emit('resolve')
      })
    }
  }

  afterupdate (el) {
    if (this.url) {
      const request = new Request(this.url)

      fetch(request, { cache: 'no-cache' }).then(response => {
        return response.blob()
      }).then(blob => {
        const objectURL = URL.createObjectURL(blob)
        this.url = objectURL
        this.machine.emit('resolve')
      }).catch(err => {
        if (err) { console.log(err) }
        this.machine.emit('reject')
      })
    }
  }

  update (props) {
    return this.url !== props.url
  }
}

module.exports = Artwork
