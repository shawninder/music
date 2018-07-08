import cloneDeep from 'lodash.clonedeep'

export default function barReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Bar:setItems':
      newState.items = action.data
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
