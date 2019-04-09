import deepEqual from 'deep-equal'

export default function ackReducer (state = {}, action) {
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'Ack:ack':
      return cloneMerge({ origin: action.origin })
    case 'Ack:addPending': {
      const id = action.data.key
      const newState = cloneMerge()
      if (!newState.pending[id]) {
        newState.pending[id] = {}
      }
      newState.pending[id][action.origin] = {
        type: action.dispatching,
        data: action.data
      }
      return newState
    }
    case 'Ack:removePending': {
      const id = action.data.key
      const newState = cloneMerge()
      if (newState.pending[id]) {
        if (newState.pending[id][action.origin]) {
          delete newState.pending[id][action.origin]
          if (deepEqual(newState.pending[id], {})) {
            delete newState.pending[id]
          }
        }
      }
      return newState
    }
    default:
      return state
  }
}
