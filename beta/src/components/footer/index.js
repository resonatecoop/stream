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
        <div class="flex flex-auto flex-column items-start flex-row-l justify-around-l mh4 mh3-l">
          <div class="flex flex-column h-100">
            <dl>
              <dt class="ttu mb2">Learn</dt>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link mid-gray pa0 lh-copy', text: 'About', href: 'https://resonate.coop/about', target: '_blank' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link mid-gray pa0 lh-copy', text: 'Pricing', href: 'https://resonate.coop/pricing', target: '_blank' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link mid-gray pa0 lh-copy', text: 'The Co-op', href: 'https://resonate.coop/the-coop', target: '_blank' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link mid-gray pa0 lh-copy',
                  text: 'Blog',
                  href: 'https://resonate.coop/blog',
                  target: '_blank'
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link mid-gray pa0 lh-copy', text: 'Handbook', href: 'https://community.resonate.is/docs', target: '_blank' })}
              </dd>
            </dl>

            <p class="dark-gray f5 ttu">© 2015-${new Date().getFullYear()} Resonate Coop</p>
          </div>
          <div class="flex flex-column h-100">
            <dl>
              <dt class="ttu mb2">Community</dt>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link mid-gray pa0 lh-copy', text: 'Join', href: 'https://resonate.is/join', target: '_blank' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link mid-gray pa0 lh-copy', text: 'Volunteering', href: 'https://resonate.coop/volunteering', target: '_blank' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link mid-gray pa0 lh-copy', text: 'Team', href: 'https://resonate.coop/team', target: '_blank' })}
              </dd>
              <dd class="ma0 pb2">
                ${link({ prefix: 'link mid-gray pa0 lh-copy', text: 'Forum', href: 'https://community.resonate.is', target: '_blank' })}
              </dd>
            </dl>

            <div class="flex flex-column h-100 justify-end">
              <p class="dark-gray f5">
                ${link({ prefix: 'link ttu', href: 'https://resonate.is/terms-conditions', text: 'Terms + Conditions' })}
              </p>
            </div>
          </div>

          <div class="flex flex-column h-100">
            <dl>
              <dt class="ttu mb2">Connect</dt>
              <dd class="ma0 pb2">
                ${[
                  { href: 'https://twitter.com/resonatecoop', text: 'TW' },
                  { href: 'https://www.facebook.com/resonatecoop', text: 'FB' },
                  { href: 'https://www.instagram.com/resonate_coop/', text: 'IG' },
                  { href: 'https://resonate.coop/new/the-blog/feed/', text: 'RSS' }
                ].map(props => {
                  return link(Object.assign(props, { prefix: 'link mid-gray ttu pa0 lh-copy mr2', target: '_blank' }))
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link mid-gray pa0 lh-copy',
                  text: 'Contact',
                  href: 'https://resonate.coop/contact',
                  target: '_blank'
                })}
              </dd>
            </dl>

            <div class="flex flex-column h-100 justify-end">
              <p class="dark-gray f5">
                ${link({ prefix: 'link ttu', href: 'https://resonate.coop/privacy-policy', text: 'Privacy Policy' })}
              </p>
            </div>
          </div>


          <div class="mb4 mb0-l flex flex-column h-100">
            <dl>
              <dt class="ttu mb2">Code</dt>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link mid-gray pa0 lh-copy',
                  text: 'Documentation',
                  href: 'https://docs.resonate.coop',
                  target: '_blank'
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link mid-gray pa0 lh-copy',
                  text: 'GitHub',
                  href: 'https://github.com/resonatecoop',
                  target: '_blank'
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link mid-gray pa0 lh-copy',
                  text: 'Report a problem',
                  href: 'https://github.com/resonatecoop/resonate/issues',
                  target: '_blank'
                })}
              </dd>
              <dd class="ma0 pb2">
                ${link({
                  prefix: 'link mid-gray pa0 lh-copy',
                  text: 'Donate',
                  href: 'https://resonate.coop/donate',
                  target: '_blank'
                })}
              </dd>
            </dl>

            <div class="flex flex-column h-100 justify-end">
              <p class="dark-gray f5">${this.state.version}</p>
            </div>
          </div>
        </div>

        <div>
          <a href="/" title="Resonate" class="link dib">
            ${icon('resonate', { size: 'full-width', class: 'fill-white mh4 mh3-l pa3' })}
          </a>
        </div>
      </footer>
    `
  }

  update () {
    return false
  }
}

module.exports = Footer
