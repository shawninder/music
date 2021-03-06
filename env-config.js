const ip = require('ip')
const prod = process.env.NODE_ENV === 'production'

const internalIP = ip.address()

module.exports = {
  'process.env.API_URL': prod ? 'https://api-gbtxraqttk.now.sh' : `http://${internalIP}:3002`,
  'process.env.WS_SERVER_URL': prod ? 'https://hub-vuvrwldjil.now.sh' : `http://${internalIP}:8000`,
  'process.env.INTERNAL_IP': internalIP
}
