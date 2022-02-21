module.exports = e => {
  const el = document.getElementById(e.target.hash.substr(1))
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  e.preventDefault()
}
