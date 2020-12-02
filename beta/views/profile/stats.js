const html = require('choo/html')
const Plays = require('../../components/charts/plays')
const ArtistLiabilities = require('../../components/charts/credits')
const viewLayout = require('../../layouts/profile')

module.exports = ProfileStatsView

function ProfileStatsView () {
  return viewLayout((state, emit) => {
    return html`
      <section class="flex flex-auto flex-column w-100 pb6">
        <div>
          ${state.cache(Plays, 'plays-chart').render({
            description: 'Plays',
            query: {
              from: '2020-01-01',
              to: '2020-11-01',
              type: 'paid',
              period: 'daily'
            }
          })}
        </div>
        <div>
          ${state.cache(ArtistLiabilities, 'earnings-by-year').render({
            description: 'Monthly earnings in 2020',
            query: {
              from: '2020-01-01',
              to: '2020-11-01',
              period: 'monthly'
            }
          })}
        </div>
      </section>
    `
  })
}
