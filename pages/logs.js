import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Events from '../data/Events'
import Logs from '../views/Logs.js'

const events = new Events()

function mapStateToProps (state) {
  const { auth, bar } = state
  return { auth, bar }
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
        const state = getState()
        console.log(`events.search('${query}')`)
        return events.search(query, nextPageToken, state.auth.username, state.auth.password)
      }
    }
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Logs)
