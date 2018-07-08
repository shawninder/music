import io from 'socket.io-client'
import { bindActionCreators, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import thunk from 'redux-thunk'
import withRedux from 'next-redux-wrapper'
import pull from 'lodash.pull'
import persistStateSS from 'redux-sessionstorage'
// import persistStateLS from 'redux-localstorage'
import syncState from '../features/party/syncState'
import App from '../components/App'
import reducer from '../reducer'
import txt from '../data/txt'
import Media from '../data/Media'

import '../styles/App.css'

const isServer = typeof window === 'undefined'

const media = new Media()

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

const defaultInitialState = {
  app: {
    showHistory: false,
    showUpNext: true,
    partyCollapsed: true,
    dragging: false
  },
  dict: {
    txt,
    availLangs: ['en', 'fr', 'es']
  },
  bar: {
    query: '',
    items: [],
    hasMore: false,
    nextPageToken: null,
    areCommands: false
  },
  player: defaultPlayer,
  queue: defaultQueue,
  socketKey: 0,
  party: {
    name: '',
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

let socket = {}
if (!isServer) {
  socket = io(defaultInitialState.party.socketUrl)
}

const enhancer = (isServer)
  ? composeWithDevTools(applyMiddleware(thunk))
  : composeWithDevTools(
    applyMiddleware(thunk),
    persistStateSS([
      'app',
      'queue',
      'party',
      'socketKey'
    ]),
    syncState([
      'queue',
      'player'
    ], {
      socket
    })
  )

// TODO Compose reducers from all capabilities and components?

const initStore = (initialState = defaultInitialState) => {
  if (!isServer && !initialState.socketKey) {
    initialState.socketKey = Math.random()
    console.log('Generated socketKey', initialState.socketKey)
  }
  return createStore(reducer, initialState, enhancer)
}

const mapStateToProps = (state) => {
  return { ...state, socket }
}

const middlewares = []
// TODO clean up nested `_dispatch`s
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    dispatch: (action) => {
      return (_dispatch) => {
        let stopPropagation = false
        middlewares.forEach((mw) => {
          if (mw(action)) {
            stopPropagation = true
          }
        })
        if (stopPropagation) {
          console.log('Intercepted and stopped propagation of', action)
        } else {
          _dispatch(action)
        }
      }
    },
    registerMiddleware: (middleware) => {
      return (_dispatch, getState) => {
        console.log('REGISTERING DISPATCH MIDDLEWARE')
        middlewares.push(middleware)
      }
    },
    unregisterMiddleware: (middleware) => {
      return (_dispatch, getState) => {
        console.warn('UNREGISTERING DISPATCH MIDDLEWARE')
        pull(middlewares, middleware)
      }
    },
    findMusic: (query, nextPageToken) => {
      return (_dispatch, getState) => {
        console.log(`media.search('${query}')`)
        return media.search(query, nextPageToken)
      }
    },
    dev: () => {
      return (_dispatch, getState) => {
        return { _dispatch, getState }
      }
    }
  }, dispatch)
}

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(App)
