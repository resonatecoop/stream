const html = require('choo/html')
const subView = require('../../layouts/default')
const raw = require('nanohtml/raw')

const items = [
  {
    question: 'Uploading music',
    answer: "We are currently developing our new Artist Upload Tool. Until development and testing are finished, <a href='https://resonate.is/music/upload/' target='_blank' rel='noopener noreferer'>our guide on how to upload to Resonate</a> is the place to go."
  },
  {
    question: 'High res downloads',
    answer: "We're working hard to make this possible in the future. Please stay with us!"
  },
  {
    question: 'High res audio streaming',
    answer: "We're planning on enabling 128 bits AAC for everyone and 256 bits AAC will be available on demand."
  },
  {
    question: 'When will I own a track?',
    answer: 'You own a track only after you have played it 9 times. Once, you own a track you can listen to it indefinitely. If you want to skip this process and reward the creator now, you may also buy the remaining plays at any time.'
  },
  {
    question: 'How much does listening will cost me?',
    answer: "It really depends how you use the player. If you usually play songs one to three time, your credits may last much longer. <a href='https://resonate.is/stream2own/' target='_blank' rel='noopener noreferer'>Learn more about our stream2own model</a>."
  },
  {
    question: 'How to change my password',
    answer: "<a href='https://resonate.is/account-settings/password/' target='_blank' rel='noopener noreferer'>Change your password</a>."
  },
  {
    question: 'I can\'t login to the player',
    answer: 'Before, requesting our support, please check that you are indeed using the email associated to your Resonate account and not something else. If you have just asked for a new password, you may have just to wait a few seconds to be able to use your new password. Also, we are aware that your password may not be accepted if it contains certain non alphanumerics. If this is the case, please request a new password.'
  },
  {
    question: 'I forgot my password',
    answer: "If you can't remember your password, you should <a href='https://resonate.is/password-reset'>request a new password from our website</a>. It might take up to a minute before you can use your new passwod to login on the beta app or upload tool."
  },
  {
    question: 'How to delete my account completely ?',
    answer: "You can <a href='https://resonate.is/account-settings/delete/' target='_blank' rel='noopener noreferer'>delete your account</a> and all your data at anytime."
  },
  {
    question: 'How to download a copy of all my data ?',
    answer: "<a href='https://resonate.is/account-settings/privacy/' target='_blank' rel='noopener noreferer'>Download or erase your data</a>."
  }
]

module.exports = () => subView(renderFaq)

function renderFaq (state, emit) {
  return html`
    <div class="flex flex-column flex-auto w-100">
      <section id="faq" class="flex flex-column w-100 ph3 pb6">
        <h1 class="f3 lh-title fw4">Frequently asked questions</h1>

        <dl class="ma0 measure">
          ${items.map((item) => {
            const { question: q, answer: a } = item

            return html`
              <dt class="b mb2">${q}</dt>
              <dd class="ma0 lh-copy mb3">
                ${raw(a)}
              </dd>
            `
          })}
        </dl>
      </section>
    </div>
  `
}
