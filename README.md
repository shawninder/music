# README

Music app built with Next.js

This project is in a very early stage and isn't looking for contributions yet. If you're still curious and need a specific part of the documentation to be written out, you can request this via an issue.

## Getting Started

`npm run`

### Dependencies

You'll need to start the following services for all features to work

- [Party server](https://github.com/shawninder/party-server)
- [YouTube search server](https://github.com/shawninder/youtube-search)

You may also want to set the following environment variables

- ZEIT_API_URL
- YOUTUBE_SEARCH_URL
- FEEDBACK_URL
- NODE_ENV
- PUBLIC_URL
- BUNDLE_ANALYZE

## Understanding and navigating the source code

In general the code is split out in the following way:

### *pages/_document.js*
- styles
- `meta` tags
- default `<title>`
- `<html lang`

### pages/....js
- state store
- default state
- side-effect stuff

### components/....js
- React-style UI components
- Higher-order components specific to the application

### data/...
App-specific data, like texts, translations

### features/....
Eventually, app-agnostic features that will be moved to separate repositories, but currently just app-specific features

### helpers/...
Generic helpers destined to be moved out to their own repos

### styles/...
App styles

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
