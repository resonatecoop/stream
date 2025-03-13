# jalla
[![stability experimental][stability-badge]][stability-link]
[![npm version][version-badge]][npm-link]
[![build status][travis-badge]][travis-link]
[![downloads][downloads-badge]][npm-link]
[![js-standard-style][standard-badge]][standard-link]

Jalla is a [Choo][choo] compiler and server in one, making web development fast,
fun and exceptionally performant.

Jalla is an excellent choice **when static files just don't cut it**. Perhaps
you need to render views dynamically, set custom headers or integrate an API.

In short, Jalla is a [Koa][koa] server, a [Browserify][browserify] bundler
for scripts and a [PostCSS][postcss] processor for styles. Documents are
compiled using [Documentify][documentify]. And it's all configured for you.

- [jalla](#jalla)
  - [Usage](#usage)
  - [Options](#options)
  - [Build](#build)
  - [Serve](#serve)
  - [API](#api)
  - [Server Side Rendering](#server-side-rendering)
    - [Custom HTML](#custom-html)
    - [Prefetching data](#prefetching-data)
    - [`ctx.state`](#ctxstate)
    - [`ctx.assets`](#ctxassets)
  - [Assets](#assets)
  - [Manifest](#manifest)
  - [Service Workers](#service-workers)
  - [Advanced Usage](#advanced-usage)
  - [Configuration](#configuration)
    - [JavaScript](#javascript)
        - [[split-require][split-require]](#split-requiresplit-require)
        - [[babelify][babelify]](#babelifybabelify)
        - [[brfs][brfs]](#brfsbrfs)
        - [[envify][envify]](#envifyenvify)
        - [[nanohtml][nanohtml] *(not used in watch mode)*](#nanohtmlnanohtml-not-used-in-watch-mode)
        - [[tinyify][tinyify] *(not used in watch mode)*](#tinyifytinyify-not-used-in-watch-mode)
    - [CSS](#css)
        - [[postcss-url][postcss-url]](#postcss-urlpostcss-url)
        - [[postcss-import][postcss-import]](#postcss-importpostcss-import)
        - [[autoprefixer][autoprefixer] *(not used in watch mode)*](#autoprefixerautoprefixer-not-used-in-watch-mode)
        - [[postcss-csso][postcss-csso] *(not used in watch mode)*](#postcss-cssopostcss-csso-not-used-in-watch-mode)
    - [HTML](#html)

## Usage
Jalla performs a series of optimizations when compiling your code. By default
it will enter development mode – meaning fast compilation times and automatic
recompilation when files are updated.

The fastes way to get up and running is by using the CLI and pointing it to your
Choo app entry point. If you name your CSS files `index.css` and place them
adjacent to your script files, they will be automatically detected and included.

```bash
$ jalla index.js
```

Setting the environment variable `NODE_ENV` to _anything other than_
`development` will cause jalla to perform more expensive compilation and optimizations on your code. Taking longer to compile but making it faster to
run.

```bash
$ NODE_ENV=production jalla index.js
```

## Options
- __`--css`__ explicitly include a css file in the build
- __`--service-worker, --sw`__ entry point for a service worker
- __`--base, -b`__ base path where app will be served
- __`--skip, -s`__ skip transform for file/glob (excluding optimizations)
- __`--watch, -w`__ watch files for changes (default in `development`)
- __`--dir, -d`__ output directory, use with [build](#build) and [serve](#serve)
- __`--quiet, -q`__ disable printing to console
- __`--inspect, -i`__ enable the node inspector, accepts a port as value
- __`--port, -p`__ port to use for server

## Build
Jalla can write all assets to disk, and then serve them statically. This greatly
increases the server startup times and makes the server more resilient to
failure or sleep. This is especially usefull for serverless plarforms, such as
[now](https://zeit.co/now) or [AWS Lambda](https://aws.amazon.com/lambda/)
et. al.

By default files will be written to the folder `dist`, but this can be changed
using the `dir` option.

```bash
$ NODE_ENV=production jalla build index.js --dir output
```

## Serve
For fast server start up times, use the `serve` command. In serve mode, jalla
will not compile any assets but instead serve built assets produced by the
[build](#build) command.

By default jalla will look for built files in the `dist` folder. Use the `dir`
option to change this.

```
$ NODE_ENV=production jalla serve --dir output
```

## API
After instantiating the jalla server, middleware can be added just like you'd do
with any [Koa][koa] app. The application is an instance of Koa and supports
[all Koa middleware][koa-middleware].

Just like the [CLI](#usage), the programatic API accepts a Choo app entry point
as it's first argument, followed by options.

```javascript
var jalla = require('jalla')
var app = jalla('index.js', {
  sw: 'sw.js',
  serve: process.env.NODE_ENV === 'production'
})

app.listen(8080)
```

## Server Side Rendering
For every request that comes in (which accepts HTML and is not an asset), unless
handeled by custom middleware, jalla will try and render an HTML response. Jalla
will await all custom middleware to finish before trying to render a HTML
response. If the response has been redirected (i.e. calling `ctx.redirect`) or
if a value has been assigned to `ctx.body` jalla will not render any HTML
response.

During server side rendering a `status` code can be added to the state which
will be used for the HTTP response. This is usefull to set proper `404` or error
codes.

```javascript
var mount = require('koa-mount')
var jalla = require('jalla')
var app = jalla('index.js')

// only allow robots in production
app.use(mount('/robots.txt', function (ctx, next) {
  ctx.type = 'text/plain'
  ctx.body = `
    User-agent: *
    Disallow: ${process.env.NODE_ENV === 'production' ? '' : '/'}
  `
}))

app.listen(8080)
```

### Custom HTML
By default, Jalla will render your app in an empty HTML document, injecting
assets and initial state. You can override the default empty document by adding
an `index.html` file adjacent to the application entry file.

You can inform jalla of where in the document you'd like to mount the
application by exporting the Choo app instance after calling `.mount()`.

```javascript
// app.js
module.exports = app.mount('#app')
```

```html
<!-- index.html -->
<body>
  <div id="app"></div>
  <footer>© 2019</footer>
</body>
```

### Prefetching data
Often times you'll need to fetch some data to render the application views. For
this, jalla will expose an array, `prefetch`, on the application state. Jalla
will render the app once and then wait for the promises in the array to resolve
before issuing another render pass using the state generated the first time.

```javascript
// store.js
var fetch = require('node-fetch')

module.exports = function (state, emitter) {
  state.data = state.data || null

  emitter.on('fetch', function () {
    var request = fetch('/my/api')
      .then((res) => res.json())
      .then(function (data) {
        state.data = data
        emitter.emit('render')
      })

    // expose request to jalla during server side render
    if (state.prefetch) state.prefetch.push(request)
  })
}
```

Apart from `prefetch`, jalla also exposes the HTTP `req` and `res` objects.
They can be usefull to read cookies or set headers. Writing to the response
stream, however, is not recommended.

### `ctx.state`
The data stored in the state object after all middleware has run will be used
as state when rendering the HTML response. The resulting application state will
be exposed to the client as `window.initialState` and will be automatically
picked up by Choo. Using `ctx.state` is how you bootstrap your client with
server generated content.

Meta data for the page being rendered can be added to `ctx.state.meta`. A
`<meta>` tag will be added to the header for every property therein.

<details>
<summary>Example decorating ctx.state</summary>

```javascript
var geoip = require('geoip-lite')

app.use(function (ctx, next) {
  if (ctx.accepts('html')) {
    ctx.state.location = geoip.lookup(ctx.ip)
  }
  return next()
})
```

</details>

### `ctx.assets`
Compiled assets are exposed on `ctx.assets` as a `Map` object. The assets hold
data such as the asset url, size and hash. There's also a `read` method for
retreiving the asset buffer.

<details>
<summary>Example adding Link headers for all JS assets</summary>

```javascript
app.use(function (ctx, next) {
  if (!ctx.accepts('html')) return next()

  for (let [id, asset] of ctx.assets) {
    if (id !== 'bundle.js' && /\.js$/.test(id)) {
      ctx.append('Link', `<${asset.url}>; rel=preload; as=script`)
    }
  }

  return next()
})
```

</details>

## Assets
Static assets can be placed in an `assets` folder adjacent to the Choo app entry
file. Files in the assets folder will be served statically by jalla.

## Manifest
A bare-bones application manifest is generated based on the projects
`package.json`. You can either place a custom `manifest.json` in the
[assets](#assets) folder or you can generate one using a custom middleware.

## Service Workers
By supplying the path to a service worker entry file with the `sw` option, jalla
will build and serve it's bundle from that path.

Registering a service worker with a Choo app is easily done using
[choo-service-worker][choo-service-worker].

```javascript
// index.js
app.use(require('choo-service-worker')('/sw.js'))
```

And then starting jalla with the `sw` option.

```bash
$ jalla index.js --sw sw.js
```

Information about application assets are exposed to the service worker during
its build and can be accessed as an environment variable.

- __`process.env.ASSET_LIST`__ a list of URLs to all included assets


<details>
<summary>Example service worker</summary>

```javascript
// index.json
var choo = require('choo')
var app = choo()

app.route('/', require('./views/home'))
app.use(require('choo-service-worker')('/sw.js'))

module.exports = app.mount('body')
```

```javascript
// sw.js
var CACHE_KEY = process.env.npm_package_version
var FILES = ['/'].concat(process.env.ASSET_LIST)

self.addEventListener('install', function oninstall (event) {
  // cache landing page and all assets once service worker is installed
  event.waitUntil(
    caches
      .open(CACHE_KEY)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', function onactivate (event) {
  // clear old caches on activate
  event.waitUntil(clear().then(function () {
    if (!self.registration.navigationPreload) return self.clients.claim()
    // enable navigation preload
    return self.registration.navigationPreload.enable().then(function () {
      return self.clients.claim()
    })
  }))
})

self.addEventListener('fetch', function onfetch (event) {
  // try and perform fetch, falling back to cached response
  event.respondWith(caches.open(CACHE_KEY).then(async function (cache) {
    try {
      var cached = await cache.match(req)
      var response = await (event.preloadResponse || self.fetch(event.request))
      if (response.ok && req.method.toUpperCase() === 'GET') {
        await cache.put(req, response.clone())
      }
      return response
    } catch (err) {
      if (cached) return cached
      return err
    }
  }))
})

// clear application cache
// () -> Promise
function clear () {
  return caches.keys().then(function (keys) {
    var caches = keys.filter((key) => key !== CACHE_KEY)
    return Promise.all(keys.map((key) => caches.delete(key)))
  })
}
```

</details>

## Advanced Usage
If you need to jack into the compilation and build pipeline of jalla, there's a
`pipeline` utility attached to the app instance. The pipline is labeled so that
you can hook into any specific step of the compilation to add or inspect assets.

Using the method `get` you can retrieve an array that holds the differnt steps
associated with a specific compilation step. You may push your own functions to
this array to have them added to the pipeline.

The labels on the pipeline are:
- __`scripts`__ compiles the main bundle and any dynamic bundles
- __`styles`__ detect CSS files and compile into single bundle
- __`assets`__ locate static assets
- __`manifest`__ generate manifest.json file unless one already exists
- __`service-worker`__ compile the service worker
- __`build`__ write files to disk

The functions in the pipeline have a similar signature to that of Choo routes.
They are instantiated with a state object and a function for emitting events.
A pipline function should return a function which will be called whenever jalla
is compiling the app. The pipline steps are called in series, and have access
to the assets and dependencies of all prior steps.

```javascript
var path = require('path')
var jalla = require('jalla')
var csv = require('csvtojson')
var app = jalla('index.js')

// convert and include data.csv as a JSON file
app.pipeline.get('assets').push(function (state, emit) {
  return async function (cb) {
    if (state.assets.has('data.json')) return cb()
    emit('progress', 'data.json')
    var json = await csv.fromFile(path.resolve(state.entry, 'data.csv'))
    emit('asset', 'data.json', Buffer.from(JSON.stringify(json)), {
      mime: 'application/json
    })
    cb()
  }
})

if (process.env.BUILD) {
  app.build(path.resolve(__dirname, 'dist'), function (err) {
    if (err) console.error(err)
    process.exit(err ? 1 : 0)
  })
} else {
  app.listen(8080)
}
```

## Configuration
The bundling is handled by tested and reliable tools which can be configured
just as you are used to.

### JavaScript
Scripts are compiled using [Browserify][browserify]. Custom transforms can be
added using the [`browserify.transform`][browserify-transform] field in your
`package.json` file.

<details>
<summary>Example browserify config</summary>

```javascript
// package.json
"browserify": {
  "transform": [
    ["aliasify", {
      "aliases": {
          "d3": "./shims/d3.js",
          "underscore": "lodash"
        }
    }]
  ]
}
```

</details>

<details>
<summary>Included Browserify optimizations</summary>

##### [split-require][split-require]
Lazily load parts of your codebase. Jalla will transform dynamic imports into
calls to split-require automatically (using a
[babel plugin][babel-dynamic-import]), meaning you only have to call
`import('./some-file')` to get bundle splitting right out of the box.

##### [babelify][babelify]
Run [babel][babel] on your sourcecode. Will respect local `.babelrc` files for
configuring the babel transform.

The following babel plugins are added by default:
- __[babel-plugin-dynamic-import-split-require][babel-dynamic-import]__
transform dynamic import calls to split-require.
- __[babel-preset-env][babel-preset-env]__: read [`.browserlist`][browserslist]
file to configure which babel plugins to support the browsers listed therein.
*Not used in watch mode*.

##### [brfs][brfs]
Inline static assets in your application using the Node.js `fs` module.

##### [envify][envify]
Use environment variables in your code.

##### [nanohtml][nanohtml] *(not used in watch mode)*
Choo-specific optimization which transpiles html templates for increased browser
performance.

##### [tinyify][tinyify] *(not used in watch mode)*
A wide suite of optimizations and minifications removing unused code,
significantly reducing file size.

</details>

### CSS
CSS files are looked up and included automaticly. Whenever a JavaScript module
is used in your application, jalla will try and find an adjacent `index.css`
file in the same location. Jalla will also respect the `style` field in a
modules `package.json` to determine which CSS file to include.

All CSS files are transpiled using [PostCSS][PostCSS]. To add PostCSS plugins,
either add a `postcss` field to your `package.json` or, if you need to
conditionally configure PostCSS, create a `.postcssrc.js` in the root of your
project. See [postcss-load-config][postcss-load-config] for details.

<details>
<summary>Example PostCSS config</summary>

```javascript
// package.json
"postcss": {
  "plugins": {
    "postcss-custom-properties": {}
  }
}
```

```javascript
// .postcssrc.js
module.exports = config

function config (ctx) {
  var plugins = []
  if (ctx.env !== 'development') {
    plugins.push(require('postcss-custom-properties'))
  }
  return { plugins }
}
```

</details>

<details>
<summary>The included PostCSS plugins</summary>

##### [postcss-url][postcss-url]
Rewrite URLs and copy assets from their source location. This means you can
reference e.g. background images and the like using relative URLs and it'll just
work™.

##### [postcss-import][postcss-import]
Inline files imported with `@import`. Works for both local files as well as for
files in `node_modules`, just like it does in Node.js.

##### [autoprefixer][autoprefixer] *(not used in watch mode)*
Automatically add vendor prefixes. Respects [`.browserlist`][browserslist] to
determine which browsers to support.

##### [postcss-csso][postcss-csso] *(not used in watch mode)*
Cleans, compresses and restructures CSS for optimal performance and file size.

</details>

### HTML
Jalla uses [Documentify][documentify] to compile server-rendered markup.
Documentify can be configured in the `package.json` (see Documentify
documentation). By default, jalla only applies HTML minification using
[posthtml-minifier][posthtml-minifier].

<details>
<summary>Example Documentify config</summary>

```javascript
// package.json
"documentify": {
  "transform": [
    ["./my-transform.js"]
  ]
}
```

```javascript
// my-transform.js
var hyperstream = require('hstream')

module.exports = transform

function transform () {
  return hyperstream({
    'html': {
      // add a class to the root html element
      class: 'page-root'
    },
    'meta[name="viewport"]': {
      // instruct Mobile Safari to expand under the iPhone X notch
      content: 'width=device-width, initial-scale=1, viewport-fit=cover'
    },
    head: {
      // add some tracking script to the header
      _appendHtml: `
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXXX-X"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'UA-XXXXXXXX-X');
        </script>
      `
    }
  })
}
```

</details>

[choo]: https://github.com/choojs/choo
[bankai]: https://github.com/choojs/bankai
[koa]: https://github.com/koajs/koa
[koa-middleware]: https://github.com/koajs/koa/wiki
[postcss]: https://github.com/postcss/postcss
[documentify]: https://github.com/stackhtml/documentify
[browserify]: https://github.com/substack/node-browserify
[split-require]: https://github.com/goto-bus-stop/split-require
[babelify]: https://github.com/babel/babelify
[brfs]: https://github.com/browserify/brfs
[envify]: https://github.com/hughsk/envify
[nanohtml]: https://github.com/choojs/nanohtml
[tinyify]: https://github.com/browserify/tinyify
[babel-dynamic-import]: https://github.com/goto-bus-stop/babel-plugin-dynamic-import-split-require
[babel]: https://babeljs.io
[babel-preset-env]: https://github.com/babel/babel-preset-env
[browserslist]: https://github.com/browserslist/browserslist
[postcss-import]: https://github.com/postcss/postcss-import
[postcss-url]: https://github.com/postcss/postcss-url
[autoprefixer]: https://github.com/postcss/autoprefixer
[postcss-csso]: https://github.com/lahmatiy/postcss-csso
[browserify-transform]: https://github.com/browserify/browserify#browserifytransform
[postcss-load-config]: https://github.com/michael-ciniawsky/postcss-load-config#readme
[posthtml-minifier]: https://github.com/Rebelmail/posthtml-minifier
[choo-service-worker]: https://github.com/choojs/choo-service-worker
[cloudflare-cache-guide]: https://support.cloudflare.com/hc/en-us/articles/200172366-How-do-I-cache-everything-on-a-URL-
[cccpurge]: https://github.com/jallajs/cccpurge

[stability-badge]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[stability-link]: https://nodejs.org/api/documentation.html#documentation_stability_index
[version-badge]: https://img.shields.io/npm/v/jalla.svg?style=flat-square
[npm-link]: https://npmjs.org/package/jalla
[travis-badge]: https://img.shields.io/travis/jallajs/jalla/master.svg?style=flat-square
[travis-link]: https://travis-ci.org/jallajs/jalla
[downloads-badge]: https://img.shields.io/npm/dm/jalla.svg?style=flat-square
[standard-badge]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-link]: https://github.com/feross/standard
