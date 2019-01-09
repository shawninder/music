const { PHASE_EXPORT, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER, PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const compose = require('next-compose-plugins')
// const withManifest = require('next-manifest')
// const withSW = require('next-offline')
const withBabelCacheBusting = require('./withBabelCacheBusting')
// const manifest = require('./manifest.js')

module.exports = (phase, { defaultConfig }) => {
  const config = [
    // [withManifest({ manifest })],
    withBabelCacheBusting
    // [withSW()]
  ]
  if (phase === PHASE_EXPORT) {

  }
  if (phase === PHASE_PRODUCTION_BUILD) {

  }
  if (phase === PHASE_PRODUCTION_SERVER) {

  }
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    const withBundleAnalyzer = require('@zeit/next-bundle-analyzer')
    config.push([withBundleAnalyzer, {
      analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
      analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
      bundleAnalyzerConfig: {
        server: {
          analyzerMode: 'static',
          reportFilename: '../../bundles/server.html'
        },
        browser: {
          analyzerMode: 'static',
          reportFilename: '../bundles/client.html'
        }
      }
    }])
  }
  return compose(config)
}
