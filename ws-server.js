const pull = require('lodash.pull')
const io = require('socket.io')()

const parties = {}

function startParty ({ req, resolve, reject, client }) {
  if (parties[req.name]) {
    reject("Can't start party, it already exists!")
  } else {
    if (req.socketKey) {
      client.on('slice', handleSlice(client, req))
      client.on('disconnect', handleHostDisconnect(client, req))
      parties[req.name] = {
        host: client,
        hostKey: req.socketKey,
        guests: [],
        state: req.state
      }
      resolve()
      console.log(`Started party ${req.name}`)
    } else {
      reject("Can't start party, no socketKey")
    }
  }
}

function stopParty ({ req, resolve, reject }) {
  const party = parties[req.name]
  if (party) {
    party.guests.forEach((guest) => {
      guest.emit('dispatch', {
        type: 'Party:ended'
      })
    })
    delete parties[req.name]
    resolve()
    console.log(`Stopped party ${req.name}`)
  } else {
    reject("Can't stop party, it doesn't exist!")
  }
}

function joinParty ({ req, resolve, reject, client }) {
  const party = parties[req.name]
  if (party) {
    if (party.guests.includes(client)) {
      reject("Can't join party, you're already attending")
    } else {
      // TODO better management of requiring clients to have `socketKey`s, etc.
      client.on('dispatch', handleGuestDispatch(client, req))
      client.on('disconnect', handleGuestDisconnect(client, req))
      party.guests.push(client)
      resolve({
        state: party.state
      })
      console.log(`${req.socketKey} joined ${req.name}`)
    }
  } else {
    reject("Can't join party, it doesn't exist!")
  }
}

function leaveParty ({ req, resolve, reject, client }) {
  if (parties[req.name]) {
    if (parties[req.name].guests.includes(client)) {
      pull(parties[req.name].guests, client)
      resolve()
      console.log(`${req.socketKey} left ${req.name}`)
    } else {
      reject("Can't leave party, you're not attending!")
    }
  } else {
    reject(`Can't leave party "${req.name}", it doesn't exist!`)
  }
}

function handleState (client) {
  return (data) => {
    const reject = (msg) => {
      const err = {
        msg,
        data
      }
      client.emit('err', err)
      console.log('rejecting', err)
    }
    const party = parties[data.name]
    if (party) {
      if (data.socketKey === party.hostKey) {
        party.state = data.slice
        party.guests.forEach((guest) => {
          guest.emit('state', party.state)
        })
        console.log('transmitted state')
      } else {
        reject("Can't accept state, you are not host of this party.")
      }
    } else {
      reject("Can't accept state, party doesn't exist")
    }
  }
}

function isParty ({ req, resolve }) {
  if (parties[req.name]) {
    resolve({
      exists: true,
      name: req.name
    })
    console.log(`${req.name} is a party`)
  } else {
    resolve({
      exists: false,
      name: req.name
    })
    console.log(`${req.name} isn't a party`)
  }
}

function handleGuestDispatch (client, req) {
  return (action) => {
    console.log('GUEST DISPATCH', action)
    const reject = (msg) => {
      const err = {
        msg,
        data: action
      }
      client.emit('err', err)
      console.log('rejecting', err)
    }
    const party = parties[action.name]
    if (party) {
      if (party.guests.includes(client)) {
        // TODO search for "emit" and guard thusly?
        if (party.host && party.host.connected) {
          console.log('dispatching to host', action)
          party.host.emit('dispatch', action)
          console.log('dispatched', action)
        } else {
          reject("Can't reach host")
        }
      } else {
        reject("Can't dispatch guest action, you're not attending!")
      }
    } else {
      reject("Can't dispatch guest action, party doesn't exist!")
    }
  }
}
function handleSlice (client, req) {
  return (action) => {
    console.log('HOST DISPATCH', action)
    const reject = (msg) => {
      const err = {
        msg,
        data: action
      }
      console.log('rejecting', err)
      client.emit('err', err)
    }
    if (action.type === 'Party:slice') {
      const party = parties[action.name]
      if (party) {
        if (party.host === client) {
          party.state = action.slice
          console.log('party.state', party.state)
          console.log('action', action)
          party.guests.forEach((guest) => {
            guest.emit('slice', action.slice)
            console.log('emitted slice', action)
          })
          console.log(`dispatch forwarded to ${party.guests.length} guests`, action)
        } else {
          reject("Can't dispatch host action, you're not the host!")
        }
      } else {
        reject("Can't dispatch host action, party doesn't exist!")
      }
    } else {
      reject(`Unknown action dispatched by host ${action.socketKey}`)
    }
  }
}

function reconnect ({ req, resolve, reject, client }) {
  const party = parties[req.name]
  if (party) {
    if (req.hosting) {
      if (party.hostKey === req.socketKey) {
        party.host = client
        client.on('slice', handleSlice(client, req))
        client.on('disconnect', handleHostDisconnect(client, req))
        if (req.state) {
          party.state = req.state
          resolve()
        } else {
          resolve({ state: party.state })
        }
        if (party.timer) {
          clearTimeout(party.timer)
        }
      } else {
        reject("You're not the host of this party")
      }
    } else if (req.attending) {
      if (party.guests.includes(client)) {
        resolve({ state: party.state })
      } else {
        client.on('dispatch', handleGuestDispatch(client, req))
        client.on('disconnect', handleGuestDisconnect(client, req))
        party.guests.push(client)
        resolve({
          state: party.state
        })
        console.log(`${req.socketKey} rejoined ${req.name}`)
        resolve({ state: party.state })
      }
    } else {
      resolve({
        exists: true
      })
    }
  } else {
    reject("Party doesn't exist")
  }
}

function handleRequest (client) {
  return (req) => {
    console.log('REQUEST', req.reqName)
    const resolve = (res) => {
      const obj = {
        req,
        res
      }
      client.emit('response', obj)
      console.log('RESPONSE', obj)
    }
    const reject = (msg) => {
      console.log('rejecting', msg)
      client.emit('response', {
        req,
        err: msg
      })
    }
    switch (req.reqName) {
      case 'isParty':
        isParty({ req, resolve, reject, client })
        break
      case 'startParty':
        startParty({ req, resolve, reject, client })
        break
      case 'joinParty':
        joinParty({ req, resolve, reject, client })
        break
      case 'stopParty':
        stopParty({ req, resolve, reject, client })
        break
      case 'leaveParty':
        leaveParty({ req, resolve, reject, client })
        break
      case 'reconnect':
        reconnect({ req, resolve, reject, client })
        break
      default:
        console.log('Unrecognized request', req.reqName)
        reject('Unrecognized request')
        break
    }
  }
}

function onConnection (client) {
  // auth until it's delegated to another micro-service?
  console.log('connection')
  client.on('request', handleRequest(client))
  client.on('slice', handleState(client))
  client.on('disconnect', () => {
    console.log('disconnection')
  })
  client.on('*', () => {
    console.log('Unkwnown event', arguments)
  })
}

function handleHostDisconnect (client, data) {
  return () => {
    const party = parties[data.name]
    if (party) {
      party.timer = setTimeout(() => {
        // TODO separate the various concerns out of functions like stopParty
        stopParty({ req: data, resolve: () => {}, reject: console.log })
      }, 20 * 60 * 1000)
    }
  }
}

function handleGuestDisconnect (client, req) {
  return () => {
    const party = parties[req.name]
    if (party) {
      pull(party.guests, client)
    }
  }
}

io.on('connection', onConnection)
io.listen(8000)
