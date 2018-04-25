const ip = require('ip')
const prod = process.env.NODE_ENV === 'production'

const internalIP = ip.address()

module.exports = {
  // TODO Get local network IP programmatically
  'process.env.YOUTUBE_SEARCH_URL': prod ? 'https://youtube-search-njnnryxzgn.now.sh' : `http://${internalIP}:3001`,
  'process.env.WS_SERVER_URL': prod ? 'https://party-server-bcaqpmhosw.now.sh' : `http://${internalIP}:8000`,
  'process.env.INTERNAL_IP': internalIP
}
