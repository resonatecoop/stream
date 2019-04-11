const Nanocomponent = require('nanocomponent')
// const nanostate = require('nanostate')
const nanologger = require('nanologger')
const html = require('choo/html')
const TrackComponent = require('@resonate/track-component')
// const css = require('sheetify')
const clock = require('mm-ss')

class TrackDetails extends Nanocomponent {
  constructor (name, state, emit) {
    super(name)

    this.emit = emit
    this.state = state

    this.log = nanologger(name)
  }

  createElement (props = {}) {
    this._track_group = props.track_group
    this._track = props.track || {}
    this._url = props.url
    this._playlist = []

    const trackComponent = this._track.id ? new TrackComponent(`track-${this._track.id}`, this.state, this.emit).render({
      style: 'blank',
      count: 0,
      index: 0,
      src: this._url,
      track: this._track,
      trackGroup: this._track_group,
      playlist: this._playlist
    }) : ''

    /*
    const table = html`
      <div class="flex flex-column ph2 mb2">
        <dl class="flex">
          <dt class="flex-auto w-100 ma0">Duration</dt>
          <dd class="flex-auto w-100 ma0 dark-gray">
            ${clock(this._track.duration)}
          </dd>
        </dl>
      </div>
    `

    */

    return html`
      <article class="mb6 flex flex-column flex-row-l flex-auto">
        <div class="flex flex-auto flex-column mw5-m mw6-l">
          <div class="db aspect-ratio aspect-ratio--1x1">
            <span role="img" style="background:url(${this._track.cover}) no-repeat;" class="bg-center cover aspect-ratio--object z-1">
            </span>
          </div>
        </div>
        <div class="flex flex-column flex-auto pa3">
          ${trackComponent}
        </div>
      </article>
    `
  }

  update (props) {
    return true
  }
}

module.exports = TrackDetails
