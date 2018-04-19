import cloneDeep from 'lodash.clonedeep'

export default function partyReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Party:connected':
      newState.connected = action.value
      break
    case 'Party:setName':
      newState.name = action.value
      break
    case 'Party:checking':
      newState.checking = action.value
      break
    case 'Party:exists':
      newState.exists = action.value
      break
    case 'Party:started':
      newState.exists = true
      newState.hosting = true
      break
    case 'Party:stopped':
      newState.exists = false
      newState.hosting = false
      break
    case 'Party:joined':
      newState.attending = true
      newState.state = action.res.state
      break
    case 'Party:left':
      newState.attending = false
      break
    case 'Party:failed':
      newState.attending = false
      newState.hosting = false
      newState.exists = false
      break
    case 'Party:reconnected': {
      if (action.res) {
        if (action.res.exists) {
          newState.exists = true
        }
        if (action.res.state) {
          newState.state = action.res.state
        }
      }
      break
    }
    case 'Party:gotState':
      console.log('gotState', action)
      newState.state = action.state
      break
    case 'Party:gotSlice':
      console.log('gotSlice', action)
      Object.assign(newState.state, action.slice)
      break
    case 'Party:dispatch': {
      // Don't modify the state here, it would create an infinite loop, see syncState redux middleware
      break
    }
  }
  return newState
}

// if (socket.connected && state.party.attending.name !== '') {
//   socket.emit({
//     type: 'guestAction',
//     action
//   })
// } else {
//   dispatch(action)
//   if (socket.connected && state.party.transmitting) {
//     socket.emit({
//       type: 'hostAction',
//       action
//     })
//   }
// }
