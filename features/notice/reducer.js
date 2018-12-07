import cloneDeep from 'lodash.clonedeep'
import merge from 'lodash.merge'

export default function noticeReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Notice:push':
      let found = false
      newState.showing.forEach((item, idx) => {
        if (item.id === action.msg.id) {
          found = true
          newState.showing[idx] = merge({}, newState.showing[idx], action.msg)
        }
      })
      if (!found) {
        newState.showing.push(action.msg)
      }
      break
    case 'Notice:remove':
      newState.showing = newState.showing.filter((item) => {
        return item.id !== action.id
      })
      break
  }
  return newState
}
