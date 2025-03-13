var jalla = require('..')

var app = jalla('index.js')

app.use(function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  for (const file of ctx.files.scripts) {
    if (file.name !== 'bundle') {
      ctx.append('Link', `<${file.url}>; rel=preload; as=script`)
    }
  }
  return next()
})
