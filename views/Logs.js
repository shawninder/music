import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import Head from '../components/Head'
import Bar from '../components/Bar'
import Log from '../components/Log'
import AuthForm from '../components/AuthForm'

import lengths from '../styles/lengths'

import resetStyles from '../styles/reset'
import baseStyles from '../styles/base'

// const isServer = typeof window === 'undefined'

class Logs extends Component {
  constructor (props) {
    super(props)
    this.loadMore = this.loadMore.bind(this)
    this.debouncedLoadMore = debounce(this.loadMore, 500, { maxWait: 750 }).bind(this) // TODO remove this debounce (possible when "loading" is implemented wherein a subsequent call would cancel, but only if calling with a different query or pageToken)
  }
  loadMore () {
    this.props.findLogs({ query: this.props.bar.query }, this.props.bar.nextPageToken).then(({ items, hasMore, prevPageToken, nextPageToken }) => {
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
        this.props.dispatch({
          type: 'Bar:setItems',
          items: this.props.bar.items.concat(newItems),
          hasMore,
          prevPageToken,
          nextPageToken
        })
      }
    })
  }
  render () {
    return (
      <div className='logsPage'>
        <Head title="Crowd's Play | Logs" />
        <style jsx global>{`
          ${resetStyles}

          ${baseStyles}

          .bar-dismiss svg {
            width: 15px;
          }

          .logsPage .bar-list {
            max-height: 100vh;
            overflow-y: scroll;
            position: fixed;
            top: ${lengths.rowHeight};
            left: 0;
            z-index: 2;
          }

          .logsPage {
            padding: 0;
            position: relative;
            height: 100%;
            width: 100%;
            background-color: #4a0045;
            overflow: scroll;
          }

          .logsContainer {
            transform: translateX(0); /* Allows this container to bound the inner fixed positioned elements */
          }

          .logsPage .bar-list.list > ol > li {
            padding: 10px;
          }

          .logsPage .bar-list.list > ol > li:nth-child(odd) {
            background: rgba(245, 245, 245, 0.50);
          }

          .logsPage .bar-list.list > ol > li:nth-child(even) {
            background: rgba(249, 249, 255, 0.25);
          }

          .authForm {
            background: violet;
            padding: 1px 1px 3px 3px;
            position: relative;
          }
        `}</style>
        <style jsx>{`
          .bgImg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
          }
          .page {
            position: relative;
            border: 0;
            z-index: 2;
          }
          .header {
            margin: 15px;
            font-size: 300%;
            color: whitesmoke;
          }
        `}</style>
        <img key='bgImg' className='bgImg' src='/static/bg.svg' alt='Blue gradient' />
        <div className='page'>
          <AuthForm dispatch={this.props.dispatch} className='authForm' />
          <h2 className='header'>Logs</h2>
          <div className='logsContainer'>
            <Bar
              className='logsBar'
              dispatch={this.props.dispatch}
              query={this.props.bar.query}
              items={this.props.bar.items}
              hasMore={this.props.bar.hasMore}
              loadMore={this.debouncedLoadMore}
              go={(query) => {
                return this.props.findLogs({ query })
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
      </div>
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'findLogs', type: PropTypes.func.isRequired },
  { name: 'bar', type: PropTypes.object.isRequired }
]

Logs.defaultProps = defaultProps(props)
Logs.propTypes = propTypes(props)

export default Logs
