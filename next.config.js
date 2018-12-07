const compose = require('next-compose-plugins')
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer')
const withManifest = require('next-manifest')
const withSW = require('next-offline')
const withBabelCacheBusting = require('./withBabelCacheBusting')
const manifest = require('./manifest.js')

module.exports = compose([
  [withManifest, { manifest: { manifest } }],
  withBabelCacheBusting,
  [withBundleAnalyzer, {
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
  }],
  withSW
])
