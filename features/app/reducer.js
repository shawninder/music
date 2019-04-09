export default function appReducer (state = {}, action) {
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'App:restoreState':
      return cloneMerge({ saved: null })
    case 'App:mergeState':
      return cloneMerge(action.state)
    case 'App:toggleShowHistory':
      return cloneMerge({ showHistory: !state.showHistory })
    case 'App:toggleShowUpNext':
      return cloneMerge({ showUpNext: !state.showUpNext })
    case 'App:toggleShowFiles':
      return cloneMerge({ showFiles: !state.showFiles })
    case 'App:toggleWIP':
      return cloneMerge({ showWIP: !state.showWIP })
    case 'App:toggleVolume':
      return cloneMerge({ showVolume: !state.showVolume })
    case 'App:dragging':
      return cloneMerge({ dragging: action.value })
    default:
      return state
  }
}
