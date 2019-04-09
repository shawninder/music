import getItems from './getItems'

export default function playNext (newState, action) {
  let items = getItems(action)
  items = items.map((item, idx) => {
    item.inQueue = true
    item.queueIndex = 1 + idx
    if (action.origin) {
      item.origin = action.origin
    }
    return item
  })
  newState.upNext = items.concat(newState.upNext.map((upcoming, idx) => {
    upcoming.queueIndex = items.length + idx + 1
    return upcoming
  }))
  return newState
}
