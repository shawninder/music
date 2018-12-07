import cloneDeep from 'lodash.clonedeep'

export default function collectionReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Collection:toggle':
      const key = action.data.key
      const collection = cloneDeep(state.collection)
      if (collection[key]) {
        delete collection[key]
        newState.collection = collection
      } else {
        collection[key] = action.data
        newState.collection = collection
      }
      break
  }
  return newState
}
