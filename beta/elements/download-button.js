const html = require('choo/html')

module.exports = downloadButton

function downloadButton ({ track }, state) {
  const { tid, name, artist, album } = track
  const href = `https://${process.env.API_DOMAIN}/v1/download/${tid}?client_id=${state.api.clientId}`
  const filename = [artist, album, name].join(' - ')

  return html`
    <a
      aria-label="Download ${name} by ${artist}"
      title="Download ${name} by ${artist}"
      href=${href}
      download="${filename}.zip"
      class="download-btn db green b--green grow tc ba bw1 br0 bg-transparent pt2 pb2 pl3 pr3"
    >
      Download
    </a>
  `
}
