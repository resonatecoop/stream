<div align="center">
  <h1 align="center">stream2own</h1>
  <strong>Play fair.</strong>
</div>

<br />

<div align="center">
  <h3>
    <a href="https://resonate.coop">
      Website
    </a>
    <span> | </span>
    <a href="https://www.twitter.com/resonatecoop/">
      Twitter
    </a>
    <span> | </span>
    <a href="https://github.com/resonatecoop/stream2own/blob/master/CONTRIBUTING.md">
      Contributing
    </a>
    <span> | </span>
    <a href="https://community.resonate.coop/t/dev-volunteers-needed-to-build-the-resonate-ecosystem/2262">
      Developer Guide
    </a>
    <span> | </span>
    <a href="https://docs.resonate.coop">
      Resonate Docs
    </a>
  </h3>
</div>

<br />

<div align="center">
  <!-- Standard -->
  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"
      alt="Standard" />
  </a>
</div>

Resonate is an open-source music streaming service run by a cooperative of artists and software developers.

If you want to know what we're building or want to get more involved, head over to the Platform category on our [forum](https://community.resonate.is/c/platform/l/latest?board=default) or read the [Developer Guide](https://community.resonate.coop/t/dev-volunteers-needed-to-build-the-resonate-ecosystem/2262) in our [Resonate Handbook](https://community.resonate.coop/docs).

If you're looking for a good first task, feel encouraged to take on an un-assigned ['help wanted' issues](https://github.com/resonatecoop/stream/issues).

Are you building something using the Resonate [API](#api) and would like to request a change? Resonate welcomes #proposals in the [Co-Operation section of the forum](https://community.resonate.coop/c/66).

## Table of Contents
- [Development](#development)
- [API](#api)
- [Testing](#testing)
- [Commands](#commands)
- [Code style](#code-style)
- [Contributors](#contributors)
- [See Also](#see-also)

## Getting Started

### Quickstart

Quick-n-dirty instructions to get the player up and running on your computer using http and pointing to the existing production API (see [API](#api) to learn more about the API).
Assumes the latest version of [node.js](https://nodejs.org/).

_Stuck? Make an issue on Github! Curious about the roadmap? Ask in the [forum](https://community.resonate.coop/t/development-team/1724)_.

Clone the repo and `cd` into it:

```sh
git@github.com:resonatecoop/stream.git
cd stream
```

Install dependencies:

```sh
npm install
```

Create your env file:

```sh
cp beta/.env.example beta/.env
```

Run the app:

```sh
npm run dev
```

You should see the app running at http://localhost:8080.

Try logging in at http://localhost:8080/login.

You can run the app at a different port using the command below:

```sh
npm run dev -- --port 8089
```

The embed app (optional)

```sh
npm run dev:embed
```

### Testing on Mobile: Using HTTPS

HTTPS is required to test PWAs on mobile. [Read more about Progressive Web Apps](https://web.dev/install-criteria/).

#### Nginx

You can find a reference [nginx configuration](/docs/nginx/beta.resonate.localhost.conf) file in the docs.
Note that the reference is not a complete `nginx.conf` file, it should fit within your existing configuration or be wrapped in a http block directive:

```
http {
  server {
  }
}
```

In the example `nginx.conf`, note the lines referring to the `ssl_certificate_key` and the `ssl_certificate_key`.

#### Generating a Custom Certificate

You can generate a custom certificate using [mkcert](https://github.com/FiloSottile/mkcert) for `beta.resonate.localhost`. *This origin is whitelisted in our CORS config*.

Generate the certificate (`cert.pem`) and key (`key.pem`) for `beta.resonate.localhost`:

```sh
mkcert -key-file key.pem -cert-file cert.pem beta.resonate.localhost
```

In your nginx.conf file, update the `ssl_certificate_key` and the `ssl_certificate_key` to refer to your new key and certificate files.

#### Update your Hosts file

Update your hosts file to include:

```
127.0.0.1       beta.resonate.localhost
```

#### Update on your .env file

```sh
APP_DOMAIN=beta.resonate.localhost
APP_HOST=https://beta.resonate.localhost
```

#### Run the app!

```sh
npm run dev
```
You should now see the player running on https://beta.resonate.localhost or

## Development

### API

If you want to build on the API for personal use, consider checking the [backlog in our community forum](https://community.resonate.coop/c/platform/52).
The Tracks API repo is currently private, but you may ask for access in the forum.

The Swagger API documentation is currently in flux and split across the [Resonate Search API](https://api.resonate.coop/v2/docs) (see the top right corner for the different services) and [Resonate Service Documentation: User](https://api.resonate.ninja/#/).

### Other Commands

### Add a package

Installing one of the monorepo packages into one of the other ones is as easy as this:
```sh
npm install @resonate/button --workspace "beta"
```
This installs `@resonate/button` into the `beta` package.

### Add a dev dependency

Here's how you would add gulp so that it can be used in any package in this repo:

```sh
npm install -D gulp
```

### Build

```sh
npm run build
```

To compile a specific package

```sh
npm run build --workspace "@resonate/rangeslider"
```

## Testing

Run all tests (lint, dependency-check)

```sh
npm test
```

Test a specific component

```sh
npm run test --workspace "@resonate/player-component"
```

A package can have browser tests (tape-run)

```sh
npm run test:browser --workspace "@resonate/api-factory-generator"
```

## Commands

Command                 | Description                                      |
------------------------|--------------------------------------------------|
`$ npm run dev`         | Start beta app development server
`$ npm test`            | Lint, validate deps & run dependency-check for all packages
`$ npm run build`       | Compile all beta app files into `beta/dist/`

## Code style

We use [eslint](https://eslint.org/) together with the [standard](https://standardjs.com/) config as a linter and javascript style guide.
Make sure to add appropriate plugin for your editor, unless it is already supported out-of-box.
It can also be handy to install the [pre-commit hook](https://pre-commit.com/) (see `.pre-commit-config.yaml`) to automatically apply the standard style.

## Maintainers

- Augustin Godiscal <auggod@resonate.is>
- Marie <marie@resonate.is>

## See Also
- [choo](https://github.com/choojs/choo) - sturdy 4kb frontend framework
- [nanohtml](https://github.com/choojs/nanohtml) - HTML template strings for the Browser with support for Server Side Rendering in Node.
  strings
- [nanocomponent](https://github.com/choojs/nanocomponent) - create performant HTML components
- [tachyons](https://github.com/tachyons-css/tachyons) - functional CSS for
  humans
