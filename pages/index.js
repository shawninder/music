import { bindActionCreators, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import thunkMiddleware from 'redux-thunk'
import withRedux from 'next-redux-wrapper'

import cloneDeep from 'lodash.clonedeep'

import App from '../components/App'

import '../styles/App.css'

const reducer = (state = {}, action) => {
  console.log('App reducer');
  console.log('state', state)
  console.log('action', action)
  const newState = cloneDeep(state)

  return newState
}

const defaultInitialState = {
  getItems: () => {
    return ['a', 'b']
  },
}

const initStore = (initialState = defaultInitialState) => {
  return createStore(reducer, initialState, composeWithDevTools(applyMiddleware(thunkMiddleware)))
}

const mapStateToProps = (state) => {
  return {
    getItems: state.getItems,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(App)
