const html = require('choo/html')
const subView = require('../layouts/outside')

module.exports = MainView

function MainView () {
  return subView((state, emit) => {
    return html`
      <section class="flex flex-column flex-row-l flex-auto w-100 pb6">
        <div class="flex flex-auto flex-column w-100">
          <article class="vh-100-l flex flex-column justify-center items-center ph5">
            <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
              <span class="b">Exploration.</span><br> Browse by labels, artists and genre with advanced search filters.
            </p>
          </article>
          <article class="vh-100-l flex flex-column justify-center items-center ph5">
            <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
              <span class="b">Play history.</span><br> Never loose track of your past listens; <span class="b">dislike a song?</span> Just hide it.
            </p>
          </article>
          <article class="vh-100-l flex flex-column justify-center items-center ph5">
            <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
              <span class="b">Built for the web and mobile.</span><br> Keep your music library synced with you at all time. No subscription or payment required.
            </p>
          </article>
          <article class="vh-100-l flex flex-column justify-center items-center ph5">
            <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
              <span class="b">No account sharing.</span><br> Simply distribute credits from one wallet to the other and share playlists.
            </p>
          </article>
          <article class="vh-100-l flex flex-column justify-center items-center ph5">
            <p class="lh-copy f4 f3-l f3-vw f4-vw-m f5-vw-l">
              <span class="b">Analytics and historical play reports.</span><br> Take a peak on your listening habits and see how much money went to creators.
            </p>
          </article>
        </div>
        <div class="flex flex-auto w-100">
        </div>
      </section>
    `
  })
}
