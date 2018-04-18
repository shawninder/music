import cloneDeep from 'lodash.clonedeep'

function playNext (state, action) {
  const newState = cloneDeep(state)
  let items = action.data
  if (!Array.isArray(items)) {
    items = [items]
  }
  const now = Date.now()
  items = items.map((item) => {
    item.key += `:${now}`
    return item
  })
  newState.upNext = items.concat(newState.upNext)
  return newState
}
function toHistory (state, action) {
  const newState = cloneDeep(state)
  let items = action.data
  if (!Array.isArray(items)) {
    items = [items]
  }
  const now = Date.now()
  newState.history = newState.history.concat(items.map((item, idx) => {
    item.key += `:${now}_${idx}`
    return item
  }))
  return newState
}

export default function queueReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Queue:play':
      newState.now = action.data
      break
    case 'Queue:toHistory': {
      newState = toHistory(newState, action)
      break
    }
    case 'Queue:playNext': {
      newState = playNext(newState, action)
      break
    }
    case 'Queue:enqueue':
      newState.upNext = newState.upNext.concat([action.data])
      break
    case 'Queue:dequeue':
      newState.upNext = action.newUpNext
      break
    case 'Queue:prev': {
      const history = newState.history
      const len = history.length
      if (len !== 0) {
        const now = newState.now
        const upNext = newState.upNext
        const previous = cloneDeep(history.pop())
        previous.key = `${previous.key.slice(0, previous.key.lastIndexOf(':'))}${Date.now()}`
        if (now && now.key) {
          upNext.unshift(now)
        }
        newState.now = previous
        newState.history = history
        newState.upNext = upNext
      }
      break
    }
    case 'Queue:next': {
      const history = newState.history
      let now = newState.now
      const upNext = newState.upNext
      let playRandom = false
      if (now && now.key) {
        const item = cloneDeep(now)
        item.key += `:${Date.now()}`
        delete item.Component
        history.push(cloneDeep(item))
      }
      if (upNext.length > 0) {
        const next = upNext.shift()
        next.key = next.key.slice(0, next.key.lastIndexOf(';'))
        newState.now = next
      } else {
        playRandom = true
      }
      newState.history = history
      newState.upNext = upNext
      if (playRandom) {
        console.log('Play random track: coming soon')
        // this.dispatch({
        //   type: 'Player:random'
        // })
      }
      break
    }
    case 'Queue:clearHistory':
      newState.history = []
      break
    case 'Queue:clearUpNext':
      newState.upNext = []
      break
    case 'Queue:jumpTo': {
      const data = action.data
      const idx = action.idx
      let skipped = []
      if (newState.now && newState.now.key) {
        const now = cloneDeep(newState.now)
        now.key += `:${Date.now()}`
        skipped.push(newState.now)
      }
      if (idx >= 0) {
        if (newState.upNext.length > 0) {
          skipped = skipped
            .concat(newState.upNext.slice(0, idx))
          newState.upNext = newState.upNext.slice(idx + 1)
        }
        if (skipped.length > 0) {
          newState = toHistory(newState, { data: skipped })
        }
      } else {
        if (newState.history.length > 0) {
          skipped = newState.history.slice(idx + 1)
            .concat(skipped)
          newState.history = newState.history.slice(0, idx)
        }
        if (skipped.length > 0) {
          newState = playNext(newState, { data: skipped })
        }
      }
      newState.now = data
      break
    }
  }
  return newState
}
