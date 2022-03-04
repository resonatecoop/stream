import mount from 'koa-mount'
import jalla from 'jalla'
import { config } from 'dotenv-safe'

config()

const app = jalla('./jalla', {
  sw: 'sw.js',
  serve: process.env.NODE_ENV === 'production'
})

const PORT = process.env.APP_PORT ?? 8080

// only allow robots in production
app.use(mount('/robots.txt', function (ctx, next) {
  ctx.type = 'text/plain'
  ctx.body = `
    User-agent: *
    Disallow: ${process.env.NODE_ENV === 'production' ? '' : '/'}
  `
}))

app.listen(PORT)
