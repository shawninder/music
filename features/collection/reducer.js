export default function collectionReducer (state = {}, action) {
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'Collection:toggle': {
      const key = action.data.key
      const newState = cloneMerge()
      const collection = { ...state.collection }
      if (collection[key]) {
        delete collection[key]
        newState.collection = collection
      } else {
        collection[key] = action.data
        newState.collection = collection
      }
      return newState
    }
    default:
      return state
  }
}
