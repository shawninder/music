import { combineReducers } from 'redux'
import appReducer from './features/app/reducer'
import collectionReducer from './features/collection/reducer'
import queueReducer from './features/queue/reducer'
import barReducer from './features/bar/reducer'
import controlsReducer from './features/controls/reducer'
import partyReducer from './features/party/reducer'
import playerReducer from './features/player/reducer'
import dictReducer from './features/dict/reducer'
const logReducer = (state = {}, action) => {
  console.log('action', action)
  return state
}

export default combineReducers({
  log: logReducer,
  app: appReducer,
  collection: collectionReducer,
  dict: dictReducer,
  queue: queueReducer,
  bar: barReducer,
  controls: controlsReducer,
  party: partyReducer,
  player: playerReducer
})
