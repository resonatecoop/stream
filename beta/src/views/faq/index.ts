import subView from '../../layouts/default'
import raw from 'nanohtml/raw'
import { View } from '../main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

const faq = [
  {
    title: 'Using the player',
    items: [
      {
        question: 'Why can\'t I listen to more than 45 seconds of a track?',
        answer: 'When not logged in, you are using Resonate in preview mode. <a href="https://resonate.is/join/" target="_blank">Create an account</a> and log in to listen to full tracks. If you are logged in and still can’t hear full tracks, you are likely out of listening credits. You can purchase more via your user menu.'
      },
      {
        question: 'Search by tag',
        answer: `
          <p>You can search for releases by tag. Type the tag as a compound word with no spaces, starting with a # symbol. You cannot enter multiple genre tags in a single search.</p>
          Examples:

          <p>Examples:</p>
          <ul>
            <li><a href="https://beta.stream.resonate.coop/tag?term=hiphop">#hiphop</a></li>
            <li><a href="https://beta.stream.resonate.coop/tag?term=chiptune">#chiptune</a></li>
            <li><a href="https://beta.stream.resonate.coop/tag?term=singersongwriter">#singersongwriter</a></li>
            <li><a href="https://beta.stream.resonate.coop/tag?term=deephouse">#deephouse</a></li>
          </ul>
        `
      },
      {
        question: 'Search by label',
        answer: 'You can find artists by label by adding <strong>label:</strong> before any search term. Example: <strong>label:Beat Machine Records</strong>. Do not add a space between <strong>label:</strong> and your search term.'
      },
      {
        question: 'Search by country',
        answer: `
          <p>You can find artists by country by adding <strong>country:</strong> before any search term. Example: <strong>country:France</strong>. Do not add a space between <strong>country:</strong> and your search term. Each word in this country&#39;s name must have its first letter capitalized; this will be fixed in the future.</p>
        `
      },
      {
        question: 'Finding your playlist',
        answer: 'Once you\'ve created playlists, they can be found be found under your Library tab. Library --> Playlists'
      },
      {
        question: 'Creating a playlist',
        answer: 'To create a playlist, find a track you wish to have on the playlist. Click the three-dot menu to the right of the track. Inside the three-dot menu, click Add to Playlist'
      },
      {
        question: 'Add to playlist',
        answer: 'On this popup window, you can set the title of your new playlist. This popup also shows a list of all your playlists. Checking boxes next to playlists adds the track to each. Unchecking boxes removes the track from playlists.'
      },
      {
        question: 'Editing or publishing a playlist',
        answer: 'By default your playlists will be private. To make a playlist public, go to your playlist. Click **Edit**. On the next screen, you can make a playlist public, change its name, or write a short description of it.'
      },
      {
        question: 'Reordering tracks on a playlist',
        answer: 'We are soon building this functionality. Not ready quite yet.'
      },
      {
        question: 'Where can I find other users\' playlists?',
        answer: `
          We're designing a new page for browsing playlists. For now, all user-made public playlists can be <a href="https://stream.resonate.coop/releases?type=playlist">found here</a>.
        `
      }
    ]
  },
  {
    title: 'Listening to music',
    items: [
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
        answer: 'Your account comes with a small amount of listening credits as a gift. As you listen to music on Resonate, credits are deducted automatically from your account. You can purchase more credits for your account by opening your user menu. Your user menu can be found at the top right of desktop view or the bottom right of mobile view. Resonate only deducts from the credits you have previously purchased for your account; there are no fees or other charges.'
      },
      {
        question: 'How much does 1 listening credit cost?',
        answer: '1 Credit / ~1.23 EUR / ~1.49 USD'
      },
      {
        question: 'How much does it cost to purchase a song?',
        answer: 'In total, a little more than 1 Credit. 1.022 Credits / ~1.25 EUR / ~1.52 USD'
      },
      {
        question: 'How does Stream2own work? How many Credits per play?',
        answer: `
          <p>Stream2own is Resonate's user-centric payment model. It lets you affordably explore new music while rewarding the artists you love -- without being interruped by transactions, advertisements, and paywalls. For each song, the price per play starts tiny and increases bit by bit, reflecting the unique relationship between each listener and the artists they listen to.
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
      }
    ]
  },
  {
    title: 'Accounts and membership',
    items: [
      {
        question: 'Do I automatically become a member of the co-op when I create a Listener Account?',
        answer: 'No, a Listener Account is not a co-op membership in itself. For artists and labels, uploading music earns membership to the co-op. For listeners, co-op membership is earned with an annual €10 contribution to the co-op.'
      },
      {
        question: 'I already have a Listener Account. How do I become a member?',
        answer: 'You can become a Listener Member <a href="https://resonate.is/join/membership/" target="_blank">here</a>.'
      },
      {
        question: 'How do I get an Artist Account?',
        answer: 'Sign up <a href="https://resonate.is/join/" target="_blank">here</a>.'
      },
      {
        question: 'What can I do with an Artist Account?',
        answer: 'With an Artist Account, you can upload your music to the Resonate Player. An Artist Account is for managing your own music or on behalf of a band or artist you represent.'
      },
      {
        question: 'How do I upload music to Resonate?',
        answer: 'Once it is ready, our new Artist Dashboard will put the upload process under your control. For now, volunteers at Resonate will upload your music for you. To submit music, log in to your Artist Account at <a href="https://resonate.is" target="_blank">https://resonate.is</a>, complete your Artist Profile, and then follow the guidance on the Submitting Music page.'
      },
      {
        question: 'How do I get a Label Account?',
        answer: 'We are rebuilding our Label Account infrastructure. Until we’re done, new signups have been paused for Label Accounts. Email <a href="mailto:members@resonate.is">members@resonate.is</a> to be notified when signup is live again.'
      },
      {
        question: 'As a small label of a few artists, do I have to wait for Label Account signup to be re-enabled? Can I sign up our artists now by creating and managing multiple Artist Accounts?',
        answer: 'You may set up individual Artist Accounts for each artist and manage those accounts directly. Each account will need a unique email address.'
      },
      {
        question: 'Can I manage multiple artists, bands or personas from an Artist Account or Label Account?',
        answer: 'No, you can not manage multiple artist profiles from a single account at this time. However, this is planned as a future feature.'
      },
      {
        question: 'Can I change my account type later?',
        answer: 'Yes. To change an existing Listener Account to an Artist Account, visit this page. For changes between other account types, contact <a href="mailto:members@resonate.is">members@resonate.is</a>. Note, changing an account type will not automatically change a previously registered membership.'
      }
    ]
  },
  {
    title: 'Troubleshooting',
    items: [
      {
        question: 'How do I change my password',
        answer: '<a href="https://resonate.is/account-settings/password/" target="_blank">Change your password</a>.'
      },
      {
        question: 'What do I do if I forgot my password?',
        answer: 'If you can\'t remember your password, you can <a href="https://resonate.is/password-reset" target="_blank">request a new password from our website</a>.'
      },
      {
        question: 'I am having log in issues',
        answer: 'Before requesting support, make sure that you are using the email associated with your Resonate account. If you are having issues, please request a new password. You may have to wait up to a minute for your new password to become active. Your password might not be accepted if it contains certain non-alphanumerics such as " and . If you have tried requesting a new password and are still having difficulties, please contact us at <a href="mailto:members@resonate.is">members@resonate.is</a> and describe your issue in detail.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'You can <a href="https://resonate.is/account-settings/delete/" target="_blank">delete your account</a> and all your data at anytime.'
      },
      {
        question: 'How do I download a copy of my data ?',
        answer: '<a href="https://resonate.is/account-settings/privacy/" target="_blank">Download or erase your data</a>.'
      }
    ]
  },
  {
    title: 'Other FAQs',
    items: [
      {
        question: 'Can I change monetisation settings of my music?',
        answer: 'Yes, you can toggle any track between monetised (stream2own) or non-monetised (free-to-stream). Currently, these are the two options. To change these settings, contact <a href="mailto:members@resonate.is">members@resonate.is</a>.'
      },
      {
        question: 'As an artist with music on Resonate, how do I receive payouts?',
        answer: 'Co-op policy is to make a payment when an artist’s earned credits cross a €10 EUR threshold (about $11.50 USD). We will reach out to you at that time to set up payment details. We are currently building the new Artist Dashboard, where artists will be able to track their plays and payout status.'
      }
    ]
  }
]

function renderFaq (): HTMLElement {
  return html`
    <div class="flex flex-column flex-auto w-100">
      <section id="faq" class="flex flex-column w-100 ph3 pb6">
        <h1 class="f3 lh-title fw4">Frequently asked questions</h1>

        <p class="measure">If you’d like help and your question isn’t answered here, request an invite to our <a href="https://community.resonate.is">Community Forum</a> where you can meet others, ask questions, and read our co-op Handbook. Resonate is a labor of love by a small community. Your ideas, music, listening and <a href="https://opencollective.com/resonate">donations</a> can help make this everything it can be.</p>

        ${faq.map((item) => {
          return html`
            <h2 class="f4 fw1">${item.title}</h2>

            <dl class="ma0 measure">
              ${item.items.map((item) => {
                const { question: q, answer: a } = item

                return html`
                  <dt class="b mb2">${q}</dt>
                  <dd class="ma0 lh-copy mb3">
                    ${raw(a)}
                  </dd>
                `
              })}
            </dl>
          `
        })}
      </section>
    </div>
  `
}

const faqView = (): View => subView(renderFaq)
export default faqView
