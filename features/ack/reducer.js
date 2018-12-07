import deepEqual from 'deep-equal'
import cloneDeep from 'lodash.clonedeep'

export default function ackReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Ack:ack':
      newState.origin = action.origin
      break
    case 'Ack:addPending': {
      const id = action.data.key
      if (!newState.pending[id]) {
        newState.pending[id] = {}
      }
      newState.pending[id][action.origin] = {
        type: action.dispatching,
        data: action.data
      }
      break
    }
    case 'Ack:removePending': {
      const id = action.data.key
      if (newState.pending[id]) {
        if (newState.pending[id][action.origin]) {
          delete newState.pending[id][action.origin]
          if (deepEqual(newState.pending[id], {})) {
            delete newState.pending[id]
          }
        }
      }
    }
  }
  return newState
}
