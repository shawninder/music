# README

Music app built with Next.js

This project is in a very early stage and isn't looking for contributions yet. If you're still curious and need a specific part of the documentation to be written out, you can request this via an issue.

### Dependencies

You'll need to start the following services for all features to work

- [MongoDB instance (data)](https://github.com/shawninder/data)
- [Party server (hub)](https://github.com/shawninder/hub)
- [API server (api)](https://github.com/shawninder/api)

You may also want to set the following environment variables

- API_URL
- NODE_ENV
- PUBLIC_URL
- BUNDLE_ANALYZE

## Getting Started

`npm run`

## Understanding and navigating the source code

In general the code is split out in the following way:

### *pages/_document.js*
- styles
- `meta` tags
- default `<title>`
- `<html lang`
- favicon
- Open Graph data
- Third party script loading
- No JS message

### pages/....js
- side-effect stuff

### views/...js
- Page layouts

### components/....js
- React-style UI components
- Higher-order components specific to the application
- SVG icons as React components (so they can be inlined and have their fill color changed via CSS)

### data/...
App-specific data, like texts, translations

### features/....
Eventually, app-agnostic features that will be moved to separate repositories, but currently just app-specific features

### helpers/...
Generic helpers destined to be moved out to their own repos

### styles/...
App styles

### static/...
Static assets accessible via `/static/...`, including privacy policy, terms, faq, pricing

### store.js
- State store
- Default state

### env-configs.js
Place to inject env vars (via babel)

### next.config.js
webpack configuration

### reducer.js
App root reducer

### registerServiceWorker.js
What the name implies

### withBabelCacheBusting
A Next.js-targetted webpack configuration "middleware" destined to be moved to its own repo

### Markdown files
Notes for eventual documentation, including this file
