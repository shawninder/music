const envConfig = require('./env-config')
module.exports = exports = {
  "presets": [
    "next/babel"
  ],
  "plugins": [
    ["transform-define", envConfig]
  ]
}
