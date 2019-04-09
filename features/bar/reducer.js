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
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'Bar:setItems':
      return cloneMerge({
        items: dedupe(action.items),
        hasMore: action.hasMore,
        nextPageToken: action.nextPageToken,
        commands: action.commands || []
      })
    case 'Bar:setQuery':
      return cloneMerge({ query: action.data })
    default:
      return state
  }
}
