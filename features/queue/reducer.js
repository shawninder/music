import cloneDeep from 'lodash.clonedeep'

import reIndexQueue from './reIndex'
import playNext from './playNext'
import toHistory from './toHistory'

export default function queueReducer (state = {}, action) {
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'Queue:play':
      return cloneMerge({
        now: {
          ...action.data,
          origin: action.origin,
          inQueue: true,
          queueIndex: 0
        }
      })
    case 'Queue:toHistory': {
      let newState = cloneMerge()
      newState = toHistory(newState, action)
      return newState
    }
    case 'Queue:playNext': {
      let newState = cloneMerge()
      newState = playNext(newState, action)
      return newState
    }
    case 'Queue:enqueue': {
      const newState = cloneMerge()
      const newItem = cloneDeep(action.data)
      newItem.inQueue = true
      newItem.queueIndex = newState.upNext.length + 1
      newState.upNext = newState.upNext.concat([newItem])
      return newState
    }
    case 'Queue:dequeue': {
      const newState = cloneMerge()
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
      return newState
    }
    case 'Queue:prev': {
      const newState = cloneMerge()
      const history = newState.history
      const len = history.length
      if (len !== 0) {
        const now = newState.now
        let upNext = newState.upNext
        console.log('Array.isArray(history)', Array.isArray(history))
        const previous = cloneDeep(history.pop())
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
      return newState
    }
    case 'Queue:next': {
      const newState = cloneMerge()
      let history = cloneDeep(newState.history)
      let now = cloneDeep(newState.now)
      let upNext = cloneDeep(newState.upNext)
      if (upNext.length > 0) {
        // Put playing now in history
        if (now && now.key) {
          const item = { ...now }
          item.queueIndex = -1
          delete item.Component
          history = history.map((i) => {
            i.queueIndex -= 1
            i.inQueue = true
            return i
          })
          history.push({ ...item })
        }

        // Shift UpNext and Play next track
        const next = upNext.shift()
        upNext = upNext.map((item, idx) => {
          item.queueIndex = 1 + idx
          item.inQueue = true
          return item
        })
        next.key = next.key.slice(0, next.key.lastIndexOf(';'))
        next.queueIndex = 0
        newState.now = next
      }
      newState.history = history
      newState.upNext = upNext
      return newState
    }
    case 'Queue:clearHistory':
      return cloneMerge({ history: [] })
    case 'Queue:clearPlayingNow':
      return cloneMerge({ now: {} })
    case 'Queue:clearUpNext':
      return cloneMerge({ upNext: [] })
    case 'Queue:clearAll':
      return cloneMerge({
        history: [],
        now: {},
        upNext: []
      })
    case 'Queue:jumpTo': {
      let newState = cloneMerge()
      const data = action.data
      const idx = action.idx
      let skipped = []
      if (newState.now && newState.now.key) {
        const now = { ...newState.now }
        skipped.push(now)
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
              ? []
              : newState.history.slice(idx + 1)
          ).concat(skipped)
          newState.history = newState.history.slice(0, idx)
        }
        if (skipped.length > 0) {
          newState = playNext(newState, { data: skipped })
        }
      }
      newState.now = data
      // Reset queueIndex and inQueue
      newState = reIndexQueue(newState)
      return newState
    }
    case 'Queue:move': {
      let newState = cloneMerge()
      const item = newState[action.from.name].splice(action.from.idx, 1)[0]
      newState[action.to.name].splice(action.to.idx, 0, item)
      newState = reIndexQueue(newState)
      return newState
    }
    case 'Queue:insert': {
      const newState = cloneMerge()
      const item = { ...action.data, origin: action.origin }
      newState[action.at.name].splice(action.at.idx, 0, item)
      if (action.at.name === 'history') {
        const hLen = newState.history.length
        newState.history = newState.history.map((historyItem, idx) => {
          historyItem.queueIndex = -hLen + idx
          historyItem.inQueue = true
          return historyItem
        })
      } else if (action.at.name === 'upNext') {
        newState.upNext = newState.upNext.map((upNextItem, idx) => {
          upNextItem.queueIndex = 1 + idx
          upNextItem.inQueue = true
          return upNextItem
        })
      }
      // newState.now.queueIndex = 0
      return newState
    }
    default:
      return state
  }
}
