import cloneDeep from 'lodash.clonedeep'

export default function appReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'App:restoreState':
      Object.assign(newState, state.saved, { saved: null })
      break
    case 'App:mergeState':
      Object.assign(newState, action.state)
      break
    case 'App:toggleShowHistory':
      newState.showHistory = !state.showHistory
      break
    case 'App:toggleShowUpNext':
      newState.showUpNext = !state.showUpNext
      break
    case 'App:toggleShowFiles':
      newState.showFiles = !state.showFiles
      break
    case 'App:toggleParty':
      newState.partyCollapsed = !state.partyCollapsed
      break
    case 'App:collapseParty':
      newState.partyCollapsed = true
      break
    case 'App:showParty':
      newState.partyCollapsed = false
      break
    case 'App:openParty':
      newState.partyCollapsed = false
      break
    case 'App:dragging':
      newState.dragging = action.value
      break
  }
  return newState
}
