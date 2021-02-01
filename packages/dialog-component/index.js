const html = require('nanohtml')
const Nanocomponent = require('nanocomponent')
const animation = require('nanoanimation')
const icon = require('@resonate/icon-element')
const dialogPonyfill = () => require('dialog-polyfill')

/**
 * Component wrapper for <dialog> element
 */

class Dialog extends Nanocomponent {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = {}

    this.onClickOutside = this.onClickOutside.bind(this)
    this.onClose = this.onClose.bind(this)
    this.open = this.open.bind(this)
  }

  createElement (props = {}) {
    const { content, prefix = 'pa0' } = props

    if (props.onClose) {
      this.onClose = props.onClose.bind(this)
    }

    this.local.title = props.title

    return html`
      <dialog class=${prefix}>
        ${this.local.title ? html`<h3 class="f3 fw1 lh-title">${this.local.title}</h3>` : ''}
        <button form="form-dialog" class="absolute z-1 top-1 right-1 grow bg-transparent b--transparent dim pa2 ma0" type="submit">
          ${icon('close', { class: 'icon icon--sm fill-black' })}
        </button>
        <form id="form-dialog" name="form-dialog" method="dialog" class="ma0 relative">
          ${content}
        </form>
      </dialog>
    `
  }

  open () {
    if (!this.element) return
    this.element.showModal()
  }

  close () {
    if (!this.element) return
    this.element.close()
  }

  /*
   * Remove component element from dom
   */

  destroy (silent) {
    if (silent) {
      this.element.removeAttribute('open')
    }
    document.body.removeChild(this.element)
  }

  onClose () {
    this.destroy()
  }

  onClickOutside (e) {
    if (!this.element) return false
    const rect = this.element.getBoundingClientRect()
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width)
    if (!isInDialog) {
      this.close()
    }
  }

  load (el) {
    dialogPonyfill().registerDialog(el)

    this.open()

    const animate = animation([
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration: 300,
      fill: 'forwards'
    })

    animate(el).play()

    this.element.addEventListener('close', this.onClose)

    this.element.addEventListener('click', this.onClickOutside)
  }

  update () {
    return false
  }
}

module.exports = Dialog
