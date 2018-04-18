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
    case 'Player:progress':
      newState.f = action.data.played
      newState.t = action.data.playedSeconds
      break
  }
  return newState
}
