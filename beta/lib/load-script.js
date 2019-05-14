const promises = {}

function loadScript (src) {
  const doc = document
  if (promises[src]) return promises[src]

  let onLoadSuccess, onLoadError
  promises[src] = new Promise((resolve, reject) => {
    onLoadSuccess = resolve
    onLoadError = reject
  })

  let loaded = false
  const tag = 'script'
  const script = doc.createElement(tag)
  script.src = src
  script.async = 1
  script.onreadystatechange = script.onload = () => {
    const { readyState } = script
    if (readyState && !['complete', 'loaded'].includes(readyState)) return
    if (loaded) return
    loaded = true
    onLoadSuccess()
  }
  script.onerror = onLoadError

  const firstScript = doc.querySelector(tag)
  firstScript.parentNode.insertBefore(script, firstScript)

  return promises[src]
}

module.exports = loadScript
