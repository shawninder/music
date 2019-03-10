export default function reIndexQueue (newState) {
  const hLen = newState.history.length
  newState.history = newState.history.map((item, idx) => {
    item.queueIndex = -hLen + idx
    item.inQueue = true
    return item
  })
  newState.now.queueIndex = 0
  newState.now.inQueue = true
  newState.upNext = newState.upNext.map((item, idx) => {
    item.queueIndex = 1 + idx
    item.inQueue = true
    return item
  })
  return newState
}
