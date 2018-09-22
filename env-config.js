const ip = require('ip')
const prod = process.env.NODE_ENV === 'production'

const internalIP = ip.address()

module.exports = {
  'process.env.API_URL': prod ? 'https://youtube-search-hjzbuoftmx.now.sh' : `http://${internalIP}:3001`,
  'process.env.FEEDBACK_URL': prod ? 'https://api-ifatubjvsh.now.sh' : `http://${internalIP}:3002/feedback`,
  'process.env.API_URL': prod ? 'https://api-ifatubjvsh.now.sh' : `http://${internalIP}:3002`,
  'process.env.WS_SERVER_URL': prod ? 'https://party-server-hzghqepbrp.now.sh' : `http://${internalIP}:8000`,
  'process.env.INTERNAL_IP': internalIP
}
