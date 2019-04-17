import merge from 'lodash.merge'

import defaultState from './defaultState'

export default function partyReducer (state = defaultState, action) {
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'Party:setSocketKey':
      return cloneMerge({ socketKey: action.value })
    case 'Party:connected':
      return cloneMerge({ connected: action.value })
    case 'Party:setName':
      return cloneMerge({ name: action.value })
    case 'Party:checking':
      return cloneMerge({ checking: action.value })
    case 'Party:exists':
      return cloneMerge({ exists: action.value })
    case 'Party:started':
      return cloneMerge({
        exists: true,
        hosting: true
      })
    case 'Party:stopped':
      return cloneMerge({
        exists: false,
        hosting: false
      })
    case 'Party:joined':
      console.log('joined: state: action.res.state =', action.res.state)
      return cloneMerge({
        attending: true,
        state: action.res.state,
        name: action.res.name
      })
    case 'Party:left':
      return cloneMerge({
        attending: false
      })
    case 'Party:failed':
      return cloneMerge({
        attending: false,
        hosting: false,
        exists: false
      })
    case 'Party:reconnected': {
      const newState = cloneMerge()
      if (action.res) {
        if (action.res.exists) {
          newState.exists = true
        }
        if (action.res.state) {
          console.log('reconnected: newState.state = action.res.state =', action.res.state)
          newState.state = action.res.state
        }
      }
      return newState
    }
    case 'Party:gotState':
      return cloneMerge({ state: action.state })
    case 'Party:gotSlice': {
      const newState = cloneMerge()
      merge(newState, { state: { ...state.state, ...action.slice } })
      return newState
    }
    case 'Party:transferStart': {
      const newState = cloneMerge()
      newState.transfers.push(action.data)
      return newState
    }
    case 'Party:dispatch':
      // Don't modify the state here, it would create an infinite loop, see syncState redux middleware
      return state
    default:
      return state
  }
}
