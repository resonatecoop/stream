const html = require('choo/html')
const Component = require('choo/component')
const icon = require('@resonate/icon-element')
const link = require('@resonate/link-element')

class Footer extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state
    this.local = state.components[id] = {}
  }

  createElement (props) {
    return html`
      <footer class="footer-component bg-black white flex flex-column flex-row-reverse-l flex-row-l pt4 pb5">
        <div class="flex flex-auto flex-column flex-row-l items-center-l justify-around-l mh3">
          <div>
            <dl>
              <dt class="clip">Beta Player</dt>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link ttu pa0 lh-copy', text: 'Browse', href: '/artists' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link ttu pa0 lh-copy', text: 'Discovery', href: '/discovery' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link ttu pa0 lh-copy', text: 'FAQ', href: '/faq' })}
              </dd>
            </dl>

            <p class="dark-gray f5 ttu">7.x-beta</p>
          </div>
          <div>
            <dl>
              <dt class="clip">Resonate</dt>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link ttu pa0 lh-copy', text: 'Explore', href: 'https://resonate.is/everything', target: '_blank' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link ttu pa0 lh-copy', text: 'Blog', href: 'https://resonate.is/blog', target: '_blank' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link ttu pa0 lh-copy', text: 'Support', href: 'https://resonate.is/support', target: '_blank' })}
              </dd>
            </dl>

            <p class="dark-gray f5">©2015-${new Date().getFullYear()} RESONATE</p>
          </div>

          <div>
            <dl>
              <dt class="clip">Code</dt>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link ttu pa0 lh-copy',
                  text: 'API documentation',
                  href: 'https://github.com/resonatecoop/upload/tree/master/docs/api.md',
                  target: '_blank'
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link ttu pa0 lh-copy',
                  text: 'Github',
                  href: 'https://github.com/resonatecoop/upload',
                  target: '_blank'
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link ttu pa0 lh-copy',
                  text: 'Gitlab',
                  href: 'https://gitlab.resonate.ninja',
                  target: '_blank'
                })}
              </dd>
            </dl>

            <p class="dark-gray f5">
              ${link({ prefix: 'link', href: 'https://resonate.is/volunteer/', text: 'VOLUNTEERING' })}
            </p>
          </div>

          <div>
            <dl>
              <dt class="clip">Informations</dt>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link ttu pa0 lh-copy',
                  text: 'Press',
                  href: 'https://resonate.is/press',
                  target: '_blank'
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link ttu pa0 lh-copy',
                  text: 'Team',
                  href: 'https://resonate.is/collaborators',
                  target: '_blank'
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link ttu pa0 lh-copy',
                  text: 'Contact',
                  href: 'https://resonate.is/contact',
                  target: '_blank'
                })}
              </dd>
            </dl>

            <p class="dark-gray f5">
              ${link({ prefix: 'link', href: 'https://resonate.is/terms-conditions/', text: 'TERMS + CONDITIONS' })}
            </p>
          </div>

          <div>
            <dl>
              <dt class="clip">Other</dt>
              <dd class="ma0 pb2">
                ${[
                  { href: 'https://twitter.com/resonatecoop', text: 'TW' },
                  { href: 'https://www.facebook.com/resonatecoop', text: 'FB' },
                  { href: 'https://www.instagram.com/resonate_coop/', text: 'IG' },
                  { href: 'https://resonate.is/new/the-blog/feed/', text: 'RSS' }
                ].map(props => {
                  return link(Object.assign(props, { prefix: 'link ttu pa0 lh-copy mr2', target: '_blank' }))
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link ttu pa0 lh-copy',
                  text: 'Community',
                  href: 'https://community.resonate.is',
                  target: '_blank'
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link ttu pa0 lh-copy',
                  text: 'Donate',
                  href: 'https://resonate.is/donate',
                  target: '_blank'
                })}
              </dd>
            </dl>

            <p class="dark-gray f5">
              ${link({ prefix: 'link', href: 'https://resonate.is/privacy-policy/', text: 'PRIVACY POLICY' })}
            </p>
          </div>
        </div>

        <a href="/" title="Resonate" class="link flex pa3">
          ${icon('resonate', { size: 'full-width', class: 'fill-white' })}
        </a>
      </footer>
    `
  }

  update () {
    return false
  }
}

module.exports = Footer
