const html = require('choo/html')
const icon = require('@resonate/icon-element')

module.exports = inputField

function inputField (inputComponent, form = {}) {
  const pristine = form.pristine
  const errors = form.errors

  return (props) => {
    const {
      prefix = 'mb5',
      labelIconName,
      labelImage = false,
      labelImageSrc,
      labelText,
      inputName,
      helpText,
      displayErrors
    } = props

    return html`
      <div class=${prefix}>
        <div class="flex flex-column flex-column-reverse">
          ${inputComponent}
          ${renderHelp(helpText)}
          ${renderLabel(labelText, labelIconName)}
        </div>
        ${displayErrors ? renderErrors(inputName) : ''}
      </div>
    `

    function renderLabel (text, iconName) {
      return html`
        <label for=${inputName} class="f4 db mv2">
          <div class="flex items-center">
            ${iconName ? html`
              <div style="width:3rem;height:3rem;" class="flex flex-shrink-0 justify-center bg-white items-center ba bw b--dark-gray mr2">
                ${icon(iconName, { size: 'sm', class: 'fill-transparent' })}
              </div>
            ` : labelImage ? renderImage(labelImageSrc) : ''}
            <span>${text}</span>
          </div>
        </label>
      `
    }

    function renderImage (src) {
      return html`
        <div class="fl w-100 mw3 mr2">
          <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark">
            <figure class="ma0">
              <img src=${src} decoding="auto" class="aspect-ratio--object z-1">
              <figcaption class="clip absolute bottom-0 truncate w-100 h2" style="top:100%;">
                Track cover
              </figcaption>
            </figure>
          </div>
        </div>
      `
    }

    function renderHelp (helpText) {
      if (helpText) {
        return html`<p class="lh-copy f5">${helpText}</p>`
      }
    }

    function renderErrors (inputName) {
      return html`
        <p class="lh-copy f5 red">
          ${errors[inputName] && !pristine[inputName] ? errors[inputName].message : ''}
        </p>
      `
    }
  }
}
