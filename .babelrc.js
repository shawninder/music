const envConfig = require('./env-config')
module.exports = exports = {
  presets: [
    ['next/babel', {
      'styled-jsx': { plugins: ['styled-jsx-plugin-postcss'] }
    }],
    ['@babel/env', {
      useBuiltIns: 'entry'
    }]
  ],
  plugins: [
    ['transform-define', envConfig]
  ]
}
