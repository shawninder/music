import merge from 'lodash.merge'

export default function noticeReducer (state = {}, action) {
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'Notice:push': {
      let found = false
      const newState = cloneMerge()
      newState.showing.forEach((item, idx) => {
        if (item.id === action.msg.id) {
          found = true
          newState.showing[idx] = merge({}, newState.showing[idx], action.msg)
        }
      })
      if (!found) {
        newState.showing.push(action.msg)
      }
      return newState
    }
    case 'Notice:remove': {
      const newState = cloneMerge()
      newState.showing = newState.showing.filter((item) => {
        return item.id !== action.id
      })
      return newState
    }
    default:
      return state
  }
}
