import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import Bar from '../components/Bar'
import Log from '../components/Log'
import '../styles/App.css'
import '../styles/logs.css'

// const isServer = typeof window === 'undefined'

class Logs extends Component {
  constructor (props) {
    super(props)
    this.dispatch = this.dispatch.bind(this)
    this.loadMore = this.loadMore.bind(this)
    this.debouncedLoadMore = debounce(this.loadMore, 500, { maxWait: 750 }).bind(this) // TODO remove this debounce (possible when "loading" is implemented wherein a subsequent call would cancel, but only if calling with a different query or pageToken)
  }
  dispatch (action) {
    this.props.dispatch(action)
  }
  loadMore () {
    this.props.findLogs(this.props.bar.query, this.props.bar.nextPageToken).then(({ items, hasMore, prevPageToken, nextPageToken }) => {
      if (items.length > 0) {
        const newItems = items.map((item) => {
          const id = item._id
          const obj = {
            type: 'LogEntry',
            key: id,
            data: item
          }
          return obj
        })
        this.dispatch({
          type: 'Bar:setItems',
          data: this.props.bar.items.concat(newItems),
          hasMore,
          prevPageToken,
          nextPageToken,
          areCommands: false
        })
      }
    })
  }
  render () {
    return (
      <div className='logsPage'>
        <form className='authForm'>
          <label>Username: </label>
          <input type='text' />
          <label>Password: </label>
          <input type='password' />
        </form>
        <h2>Logs</h2>
        <div className='logsContainer'>
          <Bar
            className='logsBar'
            dispatch={this.dispatch}
            query={this.props.bar.query}
            items={this.props.bar.items}
            hasMore={this.props.bar.hasMore}
            loadMore={this.debouncedLoadMore}
            suggest={(query) => {
              return this.props.findLogs(query)
            }}
            ResultComponent={Log}
            onRef={(ref) => {
              this.bar = ref
            }}
            autoFocus
            loadingTxt={'Loading...'}
            maxReachedTxt={'Max reached'}
          />
        </div>
      </div>
    )
  }
}

const props = [

]

Logs.defaultProps = defaultProps(props)
Logs.propTypes = propTypes(props)

export default Logs
