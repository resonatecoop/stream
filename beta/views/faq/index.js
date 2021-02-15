const html = require('choo/html')
const subView = require('../../layouts/default')
const raw = require('nanohtml/raw')

const items = [
  {
    question: 'I have a Resonate Artist Account. How do I upload music?',
    answer: 'Once it is ready, our new Upload Tool will put the upload process under your control. For now, volunteers at Resonate will upload your music for you. To submit music, please log in to your Artist Account at <a href="https://resonate.is/" target="_blank">https://resonate.is</a>, complete your Artist Profile, and then follow the guidance on the Uploading Music page.'
  },
  {
    question: 'How do I get a Resonate Artist Account?',
    answer: 'Soon, we will be re-enabling direct sign-up for new Artist Accounts. Until then, please email us at <a href="mailto:members@resonate.is">members@resonate.is</a> to join our artist waitlist. We will reach out to you soon to create your artist account and upload your music with help from our volunteers.'
  },
  {
    question: 'How do I get a Resonate Label Account?',
    answer: 'While we build our new catalog processing infrastructure, we have paused the creation of new Label Accounts. <a href="https://resonate.is/join/artist/just-one-more-step/" target="_blank">Join label waitlist</a>'
  },
  {
    question: 'Can I download music I own on Resonate?',
    answer: 'In the future, we intend to offer the ability to download tracks that you own on Resonate to your local device. This feature is not yet available.'
  },
  {
    question: 'What is Resonate\'s streaming quality?',
    answer: 'Our current streaming quality is 96 kbps AAC. In the future we intend to offer 128 bits AAC for all users. 256 bits AAC will be available on demand.'
  },
  {
    question: 'How do I add Credits to my account?',
    answer: 'Your new Resonate account comes with a small amount of Credits, on the house! As you listen to music on Resonate, Credits are deducted automatically from your account. You can purchase more credits for your account by opening the three-dot menu in your Main Menu. Resonate only deducts from the credits you have previously purchased for your account; there are no fees or other charges.'
  },
  {
    question: 'How much does a single Credit cost?',
    answer: '1 Credit / ~1.23 EUR / ~1.49 USD'
  },
  {
    question: 'How much does it cost to purchase a song?',
    answer: 'In total, a little more than 1 Credit. 1.022 Credits / ~1.25 EUR / ~1.52 USD'
  },
  {
    question: 'How do I use Credits on Resonate?',
    answer: 'The Resonate Player keeps track of how many times you\'ve listened to each song. As you listen, Credits are deducted automatically from your account using our unique Stream2own system, described below. You can also spend Credits by using the Buy Now button within a track\'s three-dot menu.'
  },
  {
    question: 'How does Stream2own work? How many Credits per play?',
    answer: `
      <p>Stream2own lets you affordably explore new music while rewarding the artists you love -- without being interruped by transactions, advertisements, and paywalls. For each song, the price per play starts tiny and increases bit by bit, reflecting the unique relationship between each listener and the artists they listen to.
      </p>
      <ul>
        <li>Your purchase of a particular song is split over the first nine times you play it.</li>
        <li>The first time you play that song it is 0.002 Credits / 0.0024 EUR / 0.0029 USD.</li>
        <li>Each time you return to that song and play it, the price doubles.</li>
        <li>The ninth play is 0.512 Credits / 0.625 EUR / 0.76 USD.</li>
      </ul>
      <p>
        After the ninth play of that song, you own it! You can stream that song for free on Resonate as much as you want. All songs you own will appear under the Collection tab inside your Library.
      </p>
    `
  },
  {
    question: 'How to change my password',
    answer: '<a href="https://resonate.is/account-settings/password/" target="_blank">Change your password</a>.'
  },
  {
    question: 'I forgot my password',
    answer: 'If you can\'t remember your password, you can <a href="https://resonate.is/password-reset" target="_blank">request a new password from our website</a>.'
  },
  {
    question: 'I can\'t login to the player',
    answer: 'Before requesting support, make sure that you are using the email associated with your Resonate account. If you are having issues, please request a new password. You may have to wait up to a minute for your new password to become active. Your password might not be accepted if it contains certain non-alphanumerics such as " and \\. If you have tried requesting a new password and are still having difficulties, please contact us at <a href="mailto:members@resonate.is">members@resonate.is</a> and describe your issue in detail.'
  },
  {
    question: 'How to delete my account completely ?',
    answer: 'You can <a href="https://resonate.is/account-settings/delete/" target="_blank">delete your account</a> and all your data at anytime.'
  },
  {
    question: 'How to download a copy of all my data ?',
    answer: '<a href="https://resonate.is/account-settings/privacy/" target="_blank">Download or erase your data</a>.'
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
