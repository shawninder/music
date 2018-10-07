import { bindActionCreators, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import withRedux from 'next-redux-wrapper'
import reducer from '../reducer'
import Logs from '../views/Logs.js'

// const isServer = typeof window === 'undefined'

const defaultInitialState = {}

const enhancer = composeWithDevTools()

const initStore = (initialState = defaultInitialState) => {
  return createStore(reducer, initialState, enhancer)
}

const mapStateToProps = (state) => {
  return { ...state }
}

// TODO clean up nested `_dispatch`s
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({

  }, dispatch)
}

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(Logs)
