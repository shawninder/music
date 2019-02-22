import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Timeline from '../views/Timeline.js'

import findLogs from '../actionCreators/findLogs'
import dispatch from '../actionCreators/dispatch'

function mapStateToProps (state) {
  const { auth, bar } = state
  return { auth, bar }
}

// TODO clean up nested `_dispatch`s
const mapDispatchToProps = (_dispatch) => {
  return bindActionCreators({
    dispatch,
    findLogs
  }, _dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline)
