import io from 'socket.io-client'
import { bindActionCreators, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import thunk from 'redux-thunk'
import withRedux from 'next-redux-wrapper'
import pull from 'lodash.pull'
import persistState from 'redux-sessionstorage'
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
    showPlayer: true
  },
  collection: {},
  dict: {
    txt,
    availLangs: ['en', 'fr', 'es']
  },
  bar: {
    query: '',
    items: []
  },
  player: defaultPlayer,
  queue: defaultQueue,
  party: {
    name: '',
    checking: false,
    exists: false,
    hosting: false,
    attending: false,
    socketUrl: process.env.WS_SERVER_URL,
    socketKey: Math.random(),
    state: {
      player: defaultPlayer,
      queue: defaultQueue
    }
  }
}

const socket = io(defaultInitialState.party.socketUrl)

const enhancer = (isServer)
  ? composeWithDevTools(applyMiddleware(thunk))
  : composeWithDevTools(
    applyMiddleware(thunk),
    persistState([
      'app',
      'queue',
      'party'
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
  return createStore(reducer, initialState, enhancer)
}

const mapStateToProps = (state) => {
  const hostKey = Math.random().toString()
  const guestKey = Math.random().toString()
  return { ...state, hostKey, guestKey, socket }
}

const middlewares = []
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    dispatch: (action) => {
      return (dispatch) => {
        let stopPropagation = false
        middlewares.forEach((mw) => {
          if (mw(action)) {
            stopPropagation = true
          }
        })
        if (!stopPropagation) {
          dispatch(action)
        } else {
          console.log('Intercepted a stopped propagation of', action)
        }
      }
    },
    registerMiddleware: (middleware) => {
      return (dispatch, getState) => {
        middlewares.push(middleware)
      }
    },
    unregisterMiddleware: (middleware) => {
      return (dispatch, getState) => {
        console.warn('UNREGISTERING MIDDLEWARE!!')
        pull(middlewares, middleware)
      }
    },
    findMusic: (query) => {
      return (dispatch, getState) => {
        console.log(`media.search(${query})`)
        return media.search(query)
      }
    },
    dev: () => {
      return (dispatch, getState) => {
        return { dispatch, getState }
      }
    }
  }, dispatch)
}

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(App)
