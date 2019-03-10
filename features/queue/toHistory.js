import cloneDeep from 'lodash.clonedeep'

import getItems from './getItems'

export default function toHistory (state, action) {
  const newState = cloneDeep(state)
  let items = getItems(action)
  newState.history = newState.history
    .map((item, idx) => {
      item.inQueue = true
      item.queueIndex = -idx - 1 - items.length
      return item
    })
    .concat(items.map((item, idx) => {
      item.inQueue = true
      item.queueIndex = -idx - 1
      if (action.origin) {
        item.origin = action.origin
      }
      return item
    }))
  return newState
}
