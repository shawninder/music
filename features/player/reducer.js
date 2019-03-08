import cloneDeep from 'lodash.clonedeep'

export default function playerReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Player:setPlaying':
      newState.playing = action.playing
      break
    case 'Player:togglePlaying':
      newState.playing = !state.playing
      break
    case 'Player:duration':
      newState.duration = action.seconds
      break
    case 'Player:progress':
      newState.f = action.data.played
      newState.t = action.data.playedSeconds
      break
    case 'Player:seek':
      newState.t = action.seconds
      if (newState.duration > 0) {
        newState.f = action.seconds / newState.duration
      }
      break
    case 'Player:setVolume':
      newState.v = action.value ? action.value : state.v
      break
  }
  return newState
}
