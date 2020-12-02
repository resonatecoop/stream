const html = require('nanohtml')

function extractTime (duration) {
  const d = Number(duration)
  const h = Math.floor(d / 60 / 60)
  const m = Math.floor(d / 60)
  const s = Math.floor(d - m * 60)
  return { h, m, s }
}

function secondsToMinutesAndSeconds (duration) {
  const d = parseFloat(duration, 10)
  if (d < 0 || isNaN(d)) return '00:00'
  const { m, s } = extractTime(d)
  return html`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function secondsToValidDuration (duration) {
  const { h, m, s } = extractTime(duration)
  return `PT${h}H${m}M${s}S`
}

function TimeElement (duration, opts = {}) {
  return html`
    <time class="${opts.class || 'currentTime'}" datetime=${secondsToValidDuration(duration)}>
      ${secondsToMinutesAndSeconds(duration)}
    </time>
  `
}

module.exports = TimeElement
