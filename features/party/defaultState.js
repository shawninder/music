const player = require('../player/defaultState')
const queue = require('../queue/defaultState')

export default {
  name: null,
  exists: false,
  hosting: false,
  attending: false,
  socketUrl: process.env.WS_SERVER_URL,
  socketKey: '',
  state: {
    player,
    queue
  },
  transfers: []
}
