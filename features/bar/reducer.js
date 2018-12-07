import cloneDeep from 'lodash.clonedeep'

function dedupe (items) {
  const keys = {}
  return items.filter((item) => {
    if (keys[item.key]) {
      return false
    }
    keys[item.key] = true
    return true
  })
}

export default function barReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Bar:setItems':
      newState.items = dedupe(action.data)
      newState.hasMore = action.hasMore
      newState.nextPageToken = action.nextPageToken
      newState.areCommands = action.areCommands
      break
    case 'Bar:setQuery':
      newState.query = action.data
      break
  }
  return newState
}
