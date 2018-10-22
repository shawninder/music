import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Events from '../data/Events'
import Logs from '../views/Logs.js'

const events = new Events()

function mapStateToProps (state) {
  const { bar } = state
  return { bar }
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

export default connect(mapStateToProps, mapDispatchToProps)(Logs)
