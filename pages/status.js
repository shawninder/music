import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import fetch from 'isomorphic-unfetch'
import btoa from 'btoa'
import Status from '../views/Status.js'

const mapStateToProps = (state) => {
  const { auth } = state
  return { auth }
}

// TODO clean up nested `_dispatch`s
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    dispatch: (action) => {
      return (_dispatch) => {
        _dispatch(action)
      }
    },
    deleteDeployment: (deploymentUid) => {
      return (_dispatch, getState) => {
        const state = getState()
        const token = btoa(`${state.auth.username}:${state.auth.password}`)
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

export default connect(mapStateToProps, mapDispatchToProps)(Status)
