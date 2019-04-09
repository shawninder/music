export default function playerReducer (state = {}, action) {
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'Player:setPlaying':
      return cloneMerge({ playing: action.playing })
    case 'Player:togglePlaying':
      return cloneMerge({ playing: !state.playing })
    case 'Player:duration':
      return cloneMerge({ duration: action.seconds })
    case 'Player:progress':
      return cloneMerge({
        f: action.data.played,
        t: action.data.playedSeconds
      })
    case 'Player:seek': {
      const newState = cloneMerge({ t: action.seconds })
      if (state.duration > 0) {
        newState.f = action.seconds / state.duration
      }
      return newState
    }
    case 'Player:setVolume':
      return cloneMerge({ v: action.value ? action.value : state.v })
    default:
      return state
  }
}
