const html = require('choo/html')
const Component = require('choo/component')
const Chartist = require('chartist')
const { isBrowser } = require('browser-or-node')

if (isBrowser) {
  require('chartist-logaxis')
  require('chartist-plugin-accessibility')
  require('chartist-plugin-pointlabels')
  require('chartist-plugin-axistitle')
}
const onIdle = require('on-idle')
const moment = require('moment')

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
      this._element = html`<div class="bg-light-gray bg-near-black--dark bg-light-gray--light br3 ma2 pt3 pr1 flex flex-auto w-100 relative ${this._name}-chart"></div>`
    } else {
      onIdle(() => {
        // this.chart.update(this.local.data)
      })
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

    const divisor = moment(this.local.query.to).diff(moment(this.local.query.from), 'months')
    const maxDivisor = 6

    const format = {
      yearly: 'MMM Y'
    }[this.local.query.period] || 'MMM'

    try {
      const response = await this.state.apiv2.plays.stats(payload)
      const type = 'Bar'
      const options = {
        plugins: [
          Chartist.plugins.ctAccessibility({
            caption: 'Plays per day',
            seriesHeader: 'Plays',
            summary: 'This chart shows your plays count per day as a listener',
            valueTransform: (value) => {
              return value + ' euros'
            }
          })
        ],
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
            const date = moment(value)
            return date.format(format)
          }
        }
      }

      if (type === 'Line') {
        options.plugins = [
          Chartist.plugins.ctPointLabels({
            textAnchor: 'middle',
            labelClass: 'ct-label f7',
            labelInterpolationFnc: (data) => {
              const value = data.split(',')[1]
              const plays = Number(value)
              return plays
            }
          })
        ]
        options.showPoint = false
        options.showLine = true
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
