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
const morph = require('nanomorph')

class CreditsChart extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state
    this.local = state.components[id] = {}

    this._update = this._update.bind(this)
  }

  createElement (props) {
    this.local.creatorId = props.creatorId
    this.local.description = props.description
    this.local.query = Object.assign({}, props.query)

    if (!this.chart) {
      this._element = html`<div class="flex flex-auto w-100 relative ${this._name}-chart"></div>`
    } else {
      onIdle(() => {
        // this.chart.update(this.local.data)
      })
    }

    return html`
      <div class="flex flex-auto w-100 mb5">
        <div class="flex flex-column flex-auto">
          <div class="flex flex-auto ph4">
            ${this._element}
          </div>
        </div>
      </div>
    `
  }

  initChart (el, config) {
    const data = config.data || { labels: [], series: [] }
    const type = config.type || 'Line'
    const options = config.options || {}
    const responsiveOptions = config.responsiveOptions || []
    return new Chartist[type](`.${this._name}-chart`, data, options, responsiveOptions)
  }

  load (el) {
    console.log('yolo')
    this._update()
  }

  async _update () {
    const divisor = moment(this.local.query.to).diff(moment(this.local.query.from), 'months')
    const maxDivisor = 6

    try {
      const response = await this.state.apiv2.plays.test({
        from: this.local.query.from,
        to: this.local.query.to,
        period: this.local.query.period
      })

      const format = {
        yearly: 'MMM Y',
        monthly: 'MMM D',
        daily: 'MMM D'
      }[this.local.query.period]

      const data = response.data
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date)
        })
        .map(item => ({
          x: new Date(item.date),
          y: item.artist_total_eur
        }))

      this.chart = this.initChart(this._element, {
        data: {
          series: [
            {
              name: 'monthly earnings',
              data: data
            }
          ]
        },
        options: {
          plugins: [
            Chartist.plugins.ctAxisTitle({
              axisX: {
                axisTitle: 'Time (' + this.local.query.period + ')',
                axisClass: 'ct-axis-title f7',
                offset: {
                  x: 0,
                  y: 50
                },
                textAnchor: 'middle'
              },
              axisY: {
                axisTitle: 'Earnings (€)',
                axisClass: 'ct-axis-title f7',
                offset: {
                  x: 0,
                  y: -1
                },
                flipTitle: false
              }
            }),
            Chartist.plugins.ctAccessibility({
              caption: 'Monthly earnings',
              seriesHeader: 'Earnings in euros',
              summary: 'This chart shows your monthly earnings',
              valueTransform: (value) => {
                return value + ' euros'
              }
            }),
            Chartist.plugins.ctPointLabels({
              textAnchor: 'middle',
              labelClass: 'ct-label f7',
              labelInterpolationFnc: (data) => {
                const value = data.split(',')[1]
                const amount = Number(value)
                const digits = 2
                if (amount > 0.1) return amount.toFixed(digits)
                return ''
              }
            })
          ],
          fullWidth: true,
          showArea: false,
          showPoint: true,
          showGrid: false,
          showLine: true,
          width: '100%',
          showGridBackground: true,
          height: '200px',
          low: 0.001,
          chartPadding: 30,
          classNames: {
            gridMinor: 'ct-grid-minor'
          },
          axisY: {
            showMinorGrid: true,
            type: Chartist.AutoScaleAxis,
            scale: 'log10',
            labelOffset: {
              x: -20
            }
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
      })
    } catch (err) {
      this.emit('error', err)
    }
  }

  update (props) {
    if (props.description !== this.local.description) {
      this.local.description = props.description
      morph(this.element.querySelector('.description'), this.renderDescription(this.local.description))
    }
    if (props.query.from !== this.local.query.from || props.query.to !== this.local.query.to || props.query.period !== this.local.query.period) {
      this.local.query = Object.assign({}, props.query)
      this._update()
    }
    return false
  }
}

module.exports = CreditsChart
