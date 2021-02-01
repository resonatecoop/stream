const html = require('choo/html')
const Component = require('choo/component')
const Chartist = require('chartist')
const differenceInMonths = require('date-fns/differenceInMonths')
const format = require('date-fns/format')
const parseISO = require('date-fns/parseISO')

const { isBrowser } = require('browser-or-node')

if (isBrowser) {
  require('chartist-logaxis')
}

class PlaysChart extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state
    this.local = state.components[id] = {}

    this._update = this._update.bind(this)
  }

  createElement (props) {
    this.local.query = props.query

    if (!this.chart) {
      this._element = html`
        <div class="bg-light-gray bg-light-gray--light bg-dark-gray--dark br3 ma2 pt3 pr1 flex flex-auto w-100 relative ${this._name}-chart"></div>
      `
    }

    return html`
      <div class="flex flex-auto w-100">
        ${this._element}
      </div>
    `
  }

  initChart (el, config) {
    const data = config.data || { labels: [], series: [] }
    const type = config.type || 'Bar'
    const options = config.options || {}
    const responsiveOptions = config.responsiveOptions || []
    return new Chartist[type](`.${this._name}-chart`, data, options, responsiveOptions)
  }

  load (el) {
    this._update()
  }

  async _update () {
    const payload = Object.assign({}, this.local.query)

    if (this.state.params.id) {
      payload.creator_id = Number(this.state.params.id)
    }

    const divisor = differenceInMonths(parseISO(this.local.query.to), parseISO(this.local.query.from))
    const maxDivisor = 6

    const dateFormat = {
      yearly: 'MMM y'
    }[this.local.query.period] || 'MMM'

    try {
      const response = await this.state.apiv2.plays.stats(payload)
      const type = 'Bar'
      const options = {
        fullWidth: true,
        showArea: false,
        showPoint: false,
        showGrid: false,
        showLine: false,
        width: '100%',
        showGridBackground: true,
        low: 1,
        classNames: {
          gridMinor: 'ct-grid-minor'
        },
        axisY: {
          labelInterpolationFnc: value => {
            return Number(value).toLocaleString()
          },
          showMinorGrid: true,
          type: Chartist.AutoScaleAxis,
          scale: 'log10'
        },
        axisX: {
          type: Chartist.FixedScaleAxis,
          divisor: divisor <= maxDivisor ? divisor : maxDivisor,
          showGrid: false,
          labelInterpolationFnc: value => {
            const date = new Date(value)
            const formatted = format(date, dateFormat)
            return formatted
          }
        }
      }

      const data = response.data
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date)
        })
        .map((item) => {
          return {
            x: new Date(item.date),
            y: item.plays
          }
        })

      this.chart = this.initChart(this._element, {
        type: type,
        data: {
          series: [
            {
              name: 'monthly earnings',
              data: data
            }
          ]
        },
        options: options
      })
    } catch (err) {
      this.emit('error', err)
    }
  }

  update (props) {
    if (props.query.from !== this.local.query.from || props.query.to !== this.local.query.to || props.query.type !== this.local.query.type || props.query.period !== this.local.query.period) {
      this.local.query = Object.assign({}, props.query)
      this._update()
    }
    return false
  }
}

module.exports = PlaysChart
