import cloneDeep from 'lodash.clonedeep'

function playNext (state, action) {
  const newState = cloneDeep(state)
  let items = cloneDeep(action.data)
  if (!Array.isArray(items)) {
    items = [items]
  }
  const now = Date.now()
  items = items.map((item, idx) => {
    item.key += `:${now}`
    item.inQueue = true
    item.queueIndex = 1 + idx
    return item
  })
  newState.upNext = items.concat(newState.upNext.map((upcoming, idx) => {
    upcoming.queueIndex = items.length + idx + 1
    return upcoming
  }))
  return newState
}
function toHistory (state, action) {
  const newState = cloneDeep(state)
  let items = cloneDeep(action.data)
  if (!Array.isArray(items)) {
    items = [items]
  }
  const now = Date.now()
  newState.history = newState.history
    .map((item, idx) => {
      item.inQueue = true
      item.queueIndex = -idx - 1 - items.length
      return item
    })
    .concat(items.map((item, idx) => {
      item.key += `:${now}_${idx}`
      item.inQueue = true
      item.queueIndex = -idx - 1
      return item
    }))
  return newState
}

export default function queueReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Queue:play':
      newState.now = cloneDeep(action.data)
      newState.now.inQueue = true
      newState.now.queueIndex = 0
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
      const newItem = cloneDeep(action.data)
      newItem.inQueue = true
      newItem.queueIndex = newState.upNext.length + 1
      newState.upNext = newState.upNext.concat([newItem])
      break
    case 'Queue:dequeue':
      if (action.newHistory) {
        newState.history = action.newHistory.map((item, idx) => {
          item.inQueue = true
          item.queueIndex = -newState.history.length + idx
          return item
        })
      }
      if (action.newUpNext) {
        newState.upNext = action.newUpNext.map((item, idx) => {
          item.queueIndex = 1 + idx
          return item
        })
      }
      break
    case 'Queue:prev': {
      const history = newState.history
      const len = history.length
      if (len !== 0) {
        const now = newState.now
        let upNext = newState.upNext
        const previous = cloneDeep(history.pop())
        previous.key = `${previous.key.slice(0, previous.key.lastIndexOf(':'))}${Date.now()}`
        previous.queueIndex = 0
        if (now && now.key) {
          now.queueIndex = 1
          upNext.unshift(now)
          upNext = upNext.map((item) => {
            item.queueIndex += 1
            item.inQueue = true
            return item
          })
        }
        newState.now = previous
        newState.history = history
        newState.upNext = upNext
      }
      break
    }
    case 'Queue:next': {
      let history = cloneDeep(newState.history)
      let now = cloneDeep(newState.now)
      let upNext = cloneDeep(newState.upNext)
      if (upNext.length > 0) {
        // Put playing now in history
        if (now && now.key) {
          const item = cloneDeep(now)
          item.key += `:${Date.now()}`
          item.queueIndex = -1
          delete item.Component
          history = history.map((i) => {
            i.queueIndex -= 1
            i.inQueue = true
            return i
          })
          history.push(cloneDeep(item))
        }

        // Play next track
        const next = upNext.shift()
        upNext = upNext.map((item, idx) => {
          item.queueIndex = 1 + idx
          item.inQueue = true
          return item
        })
        next.key = next.key.slice(0, next.key.lastIndexOf(';'))
        next.queueIndex = 0
        newState.now = next
      } else {
        // TODO
      }
      newState.history = history
      newState.upNext = upNext
      break
    }
    case 'Queue:clearHistory':
      newState.history = []
      break
    case 'Queue:clearPlayingNow':
      newState.now = {}
      break
    case 'Queue:clearUpNext':
      newState.upNext = []
      break
    case 'Queue:clearAll':
      newState.history = []
      newState.now = {}
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
          skipped = (
            (idx === -1)
              ? skipped
              : newState.history.slice(idx + 1)
          ).concat(skipped)
          newState.history = newState.history.slice(0, idx)
        }
        if (skipped.length > 0) {
          newState = playNext(newState, { data: skipped })
        }
      }
      newState.now = data
      const hLen = newState.history.length
      newState.history = newState.history.map((item, idx) => {
        item.queueIndex = -hLen + idx
        item.inQueue = true
        return item
      })
      newState.now.queueIndex = 0
      newState.upNext = newState.upNext.map((item, idx) => {
        item.queueIndex = 1 + idx
        item.inQueue = true
        return item
      })
      break
    }
    case 'Queue:move': {
      if (action.from.name === action.to.name) {
        if (action.from.idx > action.to.idx) {
          const item = newState[action.from.name].splice(action.from.idx, 1)[0]
          newState[action.to.name].splice(action.to.idx, 0, item)
        } else {
          const item = newState[action.from.name].splice(action.from.idx, 1)[0]
          newState[action.to.name].splice(action.to.idx, 0, item)
        }
      } else {
        const item = newState[action.from.name].splice(action.from.idx, 1)[0]
        newState[action.to.name].splice(action.to.idx, 0, item)
      }
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
      break
    }
    case 'Queue:insert': {
      const item = action.data
      item.key += `:${Date.now()}`
      newState[action.at.name].splice(action.at.idx, 0, item)
      if (action.at.name === 'history') {
        const hLen = newState.history.length
        newState.history = newState.history.map((item, idx) => {
          item.queueIndex = -hLen + idx
          item.inQueue = true
          return item
        })
      } else if (action.at.name === 'upNext') {
        newState.upNext = newState.upNext.map((item, idx) => {
          item.queueIndex = 1 + idx
          item.inQueue = true
          return item
        })
      }
      // newState.now.queueIndex = 0
      break
    }
  }
  return newState
}
