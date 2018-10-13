import { bindActionCreators, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import withRedux from 'next-redux-wrapper'
import reducer from '../reducer'
import Events from '../data/Events'
import Logs from '../views/Logs.js'

// const isServer = typeof window === 'undefined'

const events = new Events()

const defaultInitialState = {
  bar: {
    query: '',
    items: [],
    hasMore: false,
    nextPageToken: null,
    areCommands: false
  }
}

const enhancer = composeWithDevTools(applyMiddleware(thunk))

const initStore = (initialState = defaultInitialState) => {
  return createStore(reducer, initialState, enhancer)
}

const mapStateToProps = (state) => {
  return { ...state }
}

// TODO clean up nested `_dispatch`s
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    dispatch: (action) => {
      return (_dispatch) => {
        _dispatch(action)
      }
    },
    findLogs: (query, nextPageToken) => {
      return (_dispatch, getState) => {
        console.log(`events.search('${query}')`)
        return events.search(query, nextPageToken)
      }
    }
  }, dispatch)
}

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(Logs)
