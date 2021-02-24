const Component = require('choo/component')
const clone = require('shallow-clone')
const compare = require('nanocomponent/compare')
const html = require('choo/html')

class Grid extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.local = state.components[id] = {}

    this.local.items = []
  }

  createElement (props = { items: [] }) {
    this.local.items = props.items

    const covers = clone(this.local.items)
      .sort(() => 0.5 - Math.random())
      .slice(0, 13)

    return html`
      <article class="cf">
        ${covers.map((cover, index) => {
          const src = cover.replace('120x120', '600x600').replace('-x120', '-x600')

          return html`
            <div class="fl ${index !== 4 ? 'w-25' : 'w-50'}">
              <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark dim">
                <span role="img" class="aspect-ratio--object bg-center cover" style="background-image:url(${src});"></span>
              </div>
            </div>
          `
        })}
      </article>
    `
  }

  update (props) {
    return compare(this.local.items, props.items)
  }
}

module.exports = Grid
