const cloneDeep = require('lodash.clonedeep')
const io = require('socket.io')()

const parties = {}

function unlessMalformed (client, fn) {
  return function (data) {
    if (!data.name) {
      console.log('generally malformed', data)
      client.emit('malformed', {
        msg: 'Party request missing name'
      })
    } else {
      fn(client, data)
    }
  }
}

// ?

function isParty (client, data) {
  console.log('isParty', data);
  if (parties[data.name]) {
    if (parties[data.name].hostKey === data.hostKey) {
      client.emit('oops', {
        msg: `You are already hosting "${data.name}"`
      })
    } else if (parties[data.name].guests[data.guestKey]) {
      client.emit('oops', {
        msg: `You are already attending "${data.name}"`
      })
    } else {
      client.emit('party', {
        exists: true,
        name: data.name
      })
    }
  } else {
    client.emit('party', {
      exists: false,
      name: data.name
    })
  }
}

// HOST

function startParty (client, data) {
  if (!data.hostKey) {
    console.log('malformed for startParty')
    client.emit('malformed', {
      msg: 'Party request missing `hostKey`'
    })
  } else {
    if (parties[data.name]) {
      console.log('exists')
      client.emit('oops', {
        msg: `Party ${data.name} already exists`
      })
    } else {
      if (!data.state) {
        console.log('missing state')
        client.emit('oops', {
          msg: 'Cannot start party, missing `state`'
        })
      } else {
        console.log('starting party')
        parties[data.name] = {
          hostKey: data.hostKey,
          guests: {},
          state: data.state,
          owner: client
        }
        client.emit('partyCreated', {
          msg: `Party ${data.name} created`,
          name: data.name
        })
        client.once('disconnect', () => {
          if (parties[data.name]) {
            const party = cloneDeep(parties[data.name])
            delete parties[data.name]
            console.log(`Party ${data.name} ended`)
            Object.keys(party.guests).forEach((guestKey) => {
              party.guests[guestKey].emit('partyEnded')
            })
          }
        })
        console.log(`Party ${data.name} created`)
      }
    }
  }
}

function setState (client, data) {
  if (!parties[data.name]
    || data.hostKey !== parties[data.name].hostKey) {
    client.emit('unauthorized')
  } else if (!data.state) {
    console.log('malformed for setState')
    client.emit('malformed', {
      msg: 'Missing `state`'
    })
  } else {
    Object.keys(data.state).forEach((key) => {
      parties[data.name].state[key] = data.state[key]
    })
    client.emit('success')
    Object.keys(parties[data.name].guests).forEach((guestKey) => {
      parties[data.name].guests[guestKey].emit('state', data.state)
    })
  }
}

function answerGuest (client, data) {
  if (data.hostKey !== parties[data.name].hostKey) {
    client.emit('unauthorized')
  } else {
    if (!data.guestKey || !data.requestKey || !data.payload) {
      console.log('malformed for answerGuest')
      client.emit('malformed')
    } else {
      parties[data.name].guests[data.guestKey].emit('hostAnswer', {
        requestKey: data.requestKey,
        payload: data.payload
      })
      client.emit('success')
    }
  }
}

function endParty (client, data) {
  if (!parties[data.name] || data.hostKey !== parties[data.name].hostKey) {
    client.emit('unauthorized')
  } else {
    const party = cloneDeep(parties[data.name])
    delete parties[data.name]
    console.log(`Party ${data.name} ended`)
    Object.keys(party.guests).forEach((guestKey) => {
      party.guests[guestKey].emit('partyEnded')
    })
    client.emit('endedParty')
  }
}

// GUEST

function joinParty (client, data) {
  if (!parties[data.name]) {
    client.emit('unauthorized')
  } else {
    parties[data.name].guests[data.guestKey] = client
    client.emit('joinedParty', { name: data.name })
    console.log('joinedParty. state:', JSON.stringify(parties[data.name].state, null, 2))
    client.emit('state', parties[data.name].state)
  }
}

function getState (client, data) {
  client.emit('state', parties[data.name].state)
}

function queryHost (client, data) {
  if (!parties[data.name]) {
    client.emit('unauthorized')
  // } else if (!data.requestKey) {
  //   console.log('malformed for queryHost')
  //   client.emit('malformed')
  } else {
    console.log('sending request to host')
    parties[data.name].owner.emit('guestRequest', data.state)
    client.emit('success')
  }
}

function leaveParty (client, data) {
  if (!data.guestKey) {
    console.log('malformed for leaveParty')
    client.emit('malformed')
  } else if (parties[data.name] && parties[data.name].guests[data.guestKey]) {
    console.log(`Guest ${data.guestKey} left ${data.name}`);
    client.emit('leftParty')
    parties[data.name].guests[data.guestKey] = null
    delete parties[data.name].guests[data.guestKey]
  } else {
    client.emit('leftParty')
  }
}

// BOTH
function handleClientDisconnect (msg) {
  console.log(msg)
}

function onConnection (client) {
  console.log('connection')
  // - ?
  client.on('isParty', unlessMalformed(client, isParty))
  // - Hosts
  client.on('startParty', unlessMalformed(client, startParty))
  client.on('state', unlessMalformed(client, setState))
  client.on('answerGuest', unlessMalformed(client, answerGuest))
  client.on('stopParty', unlessMalformed(client, endParty))
  // - Guests
  client.on('joinParty', unlessMalformed(client, joinParty))
  client.on('getState', unlessMalformed(client, getState))
  client.on('queryHost', unlessMalformed(client, queryHost))
  client.on('leaveParty', unlessMalformed(client, leaveParty))
  // Do it / Throw up at it
  client.on('disconnect', handleClientDisconnect)
}
io.on('connection', onConnection)
io.listen(8000)
