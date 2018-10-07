import { bindActionCreators, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import thunk from 'redux-thunk'
import withRedux from 'next-redux-wrapper'
import fetch from 'isomorphic-unfetch'
import btoa from 'btoa'
import reducer from '../reducer'
import Status from '../views/Status.js'

// const isServer = typeof window === 'undefined'

const defaultInitialState = {
  auth: {
    username: '',
    password: ''
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
      console.log('action2', action)
      return (_dispatch) => {
        console.log('action3', action)
        _dispatch(action)
      }
    },
    deleteDeployment: (deploymentUid) => {
      return (_dispatch, getState) => {
        console.log('deploymentUid', deploymentUid)
        const state = getState()
        const token = btoa(`${state.auth.username}:${state.auth.password}`)
        console.log('state.auth.username', state.auth.username)
        console.log('state.auth.password', state.auth.password)
        console.log('token', token)
        return fetch(`${process.env.API_URL}/deployments/${deploymentUid}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${token}`
          }
        })
          .then((response) => {
            if (response.ok) {
              return true
            } else {
              throw response
            }
          })
      }
    }
  }, dispatch)
}

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(Status)
