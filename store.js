import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'
import io from 'socket.io-client'
import persistStateSS from 'redux-sessionstorage'
// import persistStateLS from 'redux-localstorage'

import syncState from './features/party/syncState'
import txt from './data/txt'
import reducer from './reducer'

const isServer = typeof window === 'undefined'

const defaultPlayer = {
  playing: false,
  duration: -1,
  t: 0,
  f: 0
}

const defaultQueue = {
  history: [],
  now: {},
  upNext: []
}

const exampleInitialState = {
  app: {
    showHistory: false,
    showUpNext: true,
    partyCollapsed: true,
    dragging: false
  },
  auth: {
    username: '',
    password: ''
  },
  bar: {
    query: '',
    items: [],
    hasMore: false,
    nextPageToken: null,
    areCommands: false
  },
  dict: {
    txt,
    availLangs: ['en', 'fr']
  },
  player: defaultPlayer,
  queue: defaultQueue,
  socketKey: 0,
  party: {
    name: null,
    checking: false,
    exists: false,
    hosting: false,
    attending: false,
    socketUrl: process.env.WS_SERVER_URL,
    state: {
      player: defaultPlayer,
      queue: defaultQueue
    }
  }
}

const composed = [applyMiddleware(thunkMiddleware)]
// TODO The following extra composed don't apply to all pages
let socket = {}
if (!isServer) {
  socket = io(exampleInitialState.party.socketUrl)
}
if (!isServer) {
  composed.push(persistStateSS([
    'app',
    'queue',
    'party',
    'socketKey'
  ]))
  composed.push(syncState([
    'queue',
    'player'
  ], {
    socket
  }))
}
const enhancer = composeWithDevTools(...composed)
export { socket }
export function initializeStore (initialState = exampleInitialState) {
  // TODO The following conditional doesn't apply to all pages
  if (!isServer && !initialState.socketKey) {
    initialState.socketKey = Math.random()
    console.log('Generated socketKey', initialState.socketKey)
  }
  return createStore(reducer, initialState, enhancer)
}
