const Component = require('choo/component')
const html = require('choo/html')
const TrackComponent = require('@resonate/track-component')

class TrackDetails extends Component {
  constructor (id, state, emit) {
    super(id)

    this.local = state.components[id] = {}

    this.local.track = {}
    this.local.data = {}

    this.emit = emit
    this.state = state
  }

  createElement (props = {}) {
    this.local.data = props
    this.local.track = props.track || {}

    return html`
      <article class="mb6 flex flex-column flex-row-l flex-auto">
        <div class="flex flex-auto flex-column mw5-m mw6-l">
          <div class="db aspect-ratio aspect-ratio--1x1">
            <span role="img" style="background:url(${this.local.track.cover}) no-repeat;" class="bg-center cover aspect-ratio--object z-1">
            </span>
          </div>
        </div>
        <div class="flex flex-column flex-auto pa3">
          ${new TrackComponent(`track-${this.local.track.id}`, this.state, this.emit).render({
            style: 'blank',
            count: this.local.data.count,
            index: 0,
            fav: this.local.data.fav,
            favorite: this.local.data.favorite,
            src: this.local.data.url,
            showArtist: true,
            track: this.local.track || {},
            trackGroup: this.local.data.track_group,
            playlist: [this.local.data]
          })}
        </div>
      </article>
    `
  }

  update (props = {}) {
    return props.track.id !== this.local.track.id ||
      props.count !== this.local.data.count
  }
}

module.exports = TrackDetails
