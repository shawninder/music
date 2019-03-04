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
  f: 0,
  v: 0.5
}

const defaultQueue = {
  history: [],
  now: {},
  upNext: []
}

const exampleInitialState = {
  ack: {
    pending: {},
    origin: null
  },
  app: {
    showHistory: false,
    showUpNext: true,
    showFiles: false,
    showWIP: false,
    partyCollapsed: true,
    dragging: false,
    pending: {}
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
  socketKey: '',
  party: {
    name: null,
    exists: false,
    hosting: false,
    attending: false,
    socketUrl: process.env.WS_SERVER_URL,
    state: {
      player: defaultPlayer,
      queue: defaultQueue
    },
    transfers: []
  },
  notice: {
    showing: []
  },
  fileInput: {
    files: []
  }
}

const composed = [applyMiddleware(thunkMiddleware)]
// TODO The following extra composed don't apply to all pages
let socket = {}
if (!isServer) {
  socket = io(exampleInitialState.party.socketUrl)
  composed.push(persistStateSS([
    'app',
    'queue',
    'party',
    'socketKey'
  ]))
  composed.push(syncState([
    'ack',
    'queue',
    'player'
  ], {
    socket
    // indexedDB
  }))
}
const enhancer = composeWithDevTools(...composed)
export { socket }
export function initializeStore (initialState = exampleInitialState) {
  // TODO The following conditional doesn't apply to all pages
  if (!isServer && !initialState.socketKey) {
    initialState.socketKey = Math.random().toString().slice(2)
    console.log('Generated socketKey', initialState.socketKey)
  }
  return createStore(reducer, initialState, enhancer)
}
