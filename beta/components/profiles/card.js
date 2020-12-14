const html = require('choo/html')

/**
 * Generic template for 1x1 profile cards (labels, artists ...)
 */

module.exports = (href, src, text, altText) => {
  altText = altText || text

  return html`
    <li class="fl w-50 w-third-m w-20-l ph3 pt3 pb4 grow first-child--large">
      <a class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray" href=${href}>
        <figure class="ma0">
          <img alt=${altText} src=${src} decoding="auto" class="aspect-ratio--object z-1">
          <figcaption class="absolute bottom-0 w-100 h3 flex flex-column" style="top:100%;">
            <span class="truncate">${text}</span>
          </figcaption>
        </figure>
      </a>
    </li>
  `
}
