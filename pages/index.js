import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import pull from 'lodash.pull'

import App from '../components/App'
import Media from '../data/Media'
import notify from '../features/notice/notify'

const media = new Media()

const mapStateToProps = (state) => {
  const { ack, app, bar, dict, player, queue, socketKey, party, notice, fileInput } = state
  return { ack, app, bar, dict, player, queue, socketKey, party, notice, fileInput }
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
    notify,
    dev: () => {
      return (_dispatch, getState) => {
        return { _dispatch, getState }
      }
    }
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
