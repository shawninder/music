import { useRef } from 'react'
import debounce from 'lodash.debounce'

import Head from '../components/Head'
import Bar from '../components/Bar'
import Log from '../components/Log'
import AuthForm from '../components/AuthForm'

import Store from '../components/Store'

import useAuth from '../features/auth/use'

import BarContext from '../features/bar/context'
import useBar from '../features/bar/use'

import lengths from '../styles/lengths'

import resetStyles from '../styles/reset'
import baseStyles from '../styles/base'
import styles from './Logs.style.js'

import Events from '../data/Events'

const events = new Events()

function Logs () {
  const [authState, authDispatch] = useAuth()
  const [barState, barDispatch] = useBar()
  const debouncedLoadMore = useRef(debounce(loadMore, 500, { maxWait: 750 }))

  function findLogs ({ query, limit }, nextPageToken) {
    return events.search({ query, limit }, nextPageToken, authState.username, authState.password)
  }

  function loadMore () {
    findLogs({ query: barState.query }, barState.nextPageToken).then(({ items, hasMore, prevPageToken, nextPageToken }) => {
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
        barDispatch({
          type: 'Bar:setItems',
          items: barState.items.concat(newItems),
          hasMore,
          prevPageToken,
          nextPageToken
        })
      }
    })
  }

  return (
    <Store providers={[
      [BarContext, { state: barState, dispatch: barDispatch }]
    ]}
    >
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
        <style jsx>{styles}</style>
        <img key='bgImg' className='bgImg' src='/static/bg.svg' alt='Blue gradient' />
        <div className='page'>
          <AuthForm dispatch={authDispatch} className='authForm' />
          <h2 className='header'>Logs</h2>
          <div className='logsContainer'>
            <Bar
              dispatch={barDispatch}
              query={barState.query}
              items={barState.items}
              hasMore={barState.hasMore}
              loadMore={debouncedLoadMore.current}
              go={(query) => {
                return findLogs({ query })
              }}
              ResultComponent={Log}
              autoFocus
              loadingTxt={'Loading...'}
              maxReachedTxt={'Max reached'}
            />
          </div>
        </div>
      </div>
    </Store>
  )
}

export default Logs
