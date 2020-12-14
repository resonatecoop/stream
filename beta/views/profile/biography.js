const raw = require('choo/html/raw')
const html = require('choo/html')

/**
 * Render artist or label description (bio) and links
 */

function renderBio (state) {
  const kind = state.route.split('/')[0]
  const { name, bio, links = [] } = state[kind].data

  return html`
    <section class="flex-auto mh3">
      <div class="flex flex-column flex-row-l">
        <article class="w-100 mw6">
          <h3 class="relative f4 mt0 fw3">
            Bio
            <a id="biography" class="absolute" style="top:-120px"></a>
          </h3>
          ${bio ? html`<p class="lh-copy">${raw(bio)}</p>` : html`<p class="lh-copy dark-gray">${name} has not provided a biography yet.</p>`}
        </article>
        <dl class="ma0 pa0 mt3 mt0-l ml4-l list flex flex-column">
          <dt class="clip">Links</dt>
          ${links.map(({ href, text }) => html`
            <dd class="ma0 pa0">
              <a href=${href} rel="noreferer noopener" target="_blank" class="link db lh-copy mb2">${text}</a>
            </dd>
          `)}
        </dl>
      </div>
    </section>
  `
}

module.exports = renderBio
