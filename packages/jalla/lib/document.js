var minifier = require('posthtml-minifier')
var posthtmlify = require('posthtmlify')
var documentify = require('documentify')
var { Readable } = require('stream')
var hyperstream = require('hstream')
var caniuse = require('caniuse-api')
var through = require('through2')
var resolve = require('resolve')
var dropcss = require('dropcss')
var jsesc = require('jsesc')
var path = require('path')

module.exports = document

var TEMPLATE = `
  <!doctype html>
  <html>
  <head></head>
  <body></body>
  </html>
`

function document (body, state, app, cb) {
  resolve('./index', {
    basedir: path.dirname(app.entry),
    extensions: ['.html']
  }, function (err, file) {
    try {
      if (err) cb(null, render(null, TEMPLATE))
      else cb(null, render(file, null))
    } catch (err) {
      cb(err)
    }
  })

  function render (template, html) {
    var selector = require(app.entry).selector
    var d = documentify(template, html)

    d.transform(function () {
      var opts = { html: { lang: state.language || 'en' } }
      if (selector && body) opts[selector] = { _replaceHtml: body }
      return hyperstream(opts)
    })

    d.transform((str) => hyperstream({ body: { _appendHtml: str } }), `
      <script>window.initialState = JSON.parse(${stringify(state)})</script>
    `)

    /**
     * The following transforms are prepended in reverse order to ensure that
     * they come _before_ possible custom html head elements
     */

    if (app.env === 'development') {
      d.transform(prependToHead, `
        <script src="${app.context.assets.get('bundle.js').url}" defer></script>
        <link rel="stylesheet" href="${app.context.assets.get('bundle.css').url}">
      `)
    } else {
      const script = app.context.assets.get('bundle.js')
      const styles = app.context.assets.get('bundle.css')
      const features = process.env.POLYFILL_FEATURES

      if (!caniuse.isSupported('link-rel-preload', app.browsers.join(','))) {
        d.transform(prependToHead, `
          <script>
            (function (tokens) {
              try {
                var supports = tokens.supports('preload');
              } catch (e) {}
              if (supports) return;
              var links = document.querySelectorAll('link[rel=preload][as=style]');
              for (var i = 0, len = links.length; i < len; i++) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = links[i].href;
                document.head.append(link);
              }
            }(document.createElement('link').relList))
          </script>
        `)
      }

      d.transform(prependToHead, `
        <link rel="preload" as="style" href="${styles.url}" onload="this.rel='stylesheet'">
        <script src="https://polyfill.io/v3/polyfill.min.js${features ? `?features=${features}` : ''}"></script>
        <script src="${script.url}" defer></script>
      `)

      d.transform(prependCriticalCSS(styles.read.bind(styles)))
    }

    if (state.meta) {
      const keys = Object.keys(state.meta)
      if (keys.length) {
        const tags = keys.map(function (key) {
          if (key === 'title') return
          var type = key.indexOf('og:') !== -1 ? 'property' : 'name'
          var value = state.meta[key]
          if (typeof value === 'string') value = value.replace(/"/g, '&quot;')
          return `<meta ${type}="${key}" content="${value}">`
        })
        if (!keys.includes('theme-color')) {
          tags.push('<meta name="theme-color" content="#fff">')
        }
        d.transform(prependToHead, tags.join('\n'))
      }
    }

    d.transform(prependToHead, `
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="manifest" href="${app.base}/manifest.json">
    `)

    if (state.title) {
      const title = state.title.trim().replace(/\n/g, '')
      d.transform(prependToHead, `<title>${title}</title>`)
    }

    d.transform(prependToHead, `
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
    `)

    d.transform(posthtmlify, {
      order: 'end',
      use: [[minifier, {
        minifyJS: true,
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeEmptyAttributes: true,
        removeComments: app.env !== 'development'
      }]]
    })

    return d.bundle()
  }
}

// stringify data as safely escaped JSON
// obj -> str
function stringify (data) {
  return jsesc(JSON.stringify(data), {
    json: true,
    isScriptContext: true
  })
}

// create documentify transform adding content to `head`
// str -> Stream
function prependToHead (str) {
  return hyperstream({ head: { _prependHtml: str } })
}

// create documentify transform inlining critical CSS
// str -> Stream
function prependCriticalCSS (getStyles) {
  var html = ''

  return function () {
    return through(collect, compose)
  }

  // collect html but push nothing
  // (str, str, fn) -> void
  function collect (chunk, enc, cb) {
    html += chunk
    cb(null)
  }

  // compose middleman stream for inlining the CSS
  // fn -> void
  function compose (cb) {
    var res = ''
    var self = this

    getStyles().then(function (css) {
      try {
        var critical = dropcss({ html: html, css: css.toString() })
      } catch (err) {
        // fail silently and skip inline styles
        self.push(html)
        return cb()
      }

      var prepend = hyperstream({
        head: {
          _prependHtml: `<style>${critical.css}</style>`
        }
      })
      var stream = new Readable()
      stream._read = Function.prototype

      // pipe the collected html through hyperstream forwarding to self
      stream.pipe(prepend).pipe(through(write, end))
      stream.push(html)
      stream.push(null)
    }, cb)

    // collect the resulting html with inlined CSS
    // (str, str, fn) -> void
    function write (chunk, enc, cb) {
      res += chunk
      cb(null, chunk)
    }

    // resolve self with the complete HTML (with inlined CSS)
    // fn -> void
    function end (done) {
      self.push(res)
      done()
      cb()
    }
  }
}
