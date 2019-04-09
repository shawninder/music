import React, { useState } from 'react'
import moment from 'moment'

import Head from '../components/Head'
import AuthForm from '../components/AuthForm'
import Heatmap from '../components/Heatmap'

import List from '../components/List'
import Log from '../components/Log'

import useAuth from '../features/auth/use'

import resetStyles from '../styles/reset'
import baseStyles from '../styles/base'
import colors from '../styles/colors'

import Events from '../data/Events'

const events = new Events()

const lifecycleEvents = [
  'Server started'
]

const commandEvents = [
  'Request',
  'Response',
  'Error response'
]

const guestEvents = [
  'Guest wants to join',
  'Guest joined',
  'Guest wants to leave',
  'Guest removed from party',
  'Guest disconnected',
  'Guest removed from party',
  'Guest rejoined'
]

const dispatchEvents = [
  'Guest dispatched an action',
  'Forwarding dispatch to host',
  'Host dispatch',
  'Host dispatch failed',
  'Emitting slice',
  'Emitting dispatch to guest'
]

const transferEvents = [
  'Guest sent file chunk',
  'Forwarding file chunk to host',
  'Host got file',
  'Host requested chunk'
]

const playlistEvents = [
  'Checking party existence',
  'Party exists',
  "Party doesn't exist",
  'Host wants to start a party',
  'Host wants to stop party',
  'Host started party',
  'Party deleted',
  'Initiating party self-destruct',
  'Host reconnected, self-destruct canceled'
]

const connectionEvents = [
  'Client connect',
  'Host reconnected',
  'Guest disconnected',
  'Host disconnected',
  'Host reconnected',
  'Client reconnecting'
]

const errorEvents = [
  'Guest dispatch failed',
  'Guest file chunk failed',
  'Rejecting request',
  'Handling host got file failed',
  'Handling request chunk failed',
  "Can't stop party, it doesn't exist!"
]

function Timeline () {
  const [lifecycle, setLifecycle] = useState(true)
  const [commands, setCommands] = useState(false)
  const [guests, setGuests] = useState(true)
  const [dispatches, setDispatches] = useState(false)
  const [transfers, setTransfers] = useState(false)
  const [playlists, setPlaylists] = useState(true)
  const [connections, setConnections] = useState(false)
  const [errors, setErrors] = useState(true)
  const [playlistName, setPlaylistName] = useState('')
  const [from, setFrom] = useState(moment().subtract(2, 'months').startOf('month').format('YYYY-MM-DD'))
  const [to, setTo] = useState(moment().endOf('month').format('YYYY-MM-DD'))
  const [logs, setLogs] = useState([])
  const [aggs, setAggs] = useState([])

  const [authState, authDispatch] = useAuth()

  function findLogs ({ query, limit }, nextPageToken) {
    return events.search({ query, limit }, nextPageToken, authState.username, authState.password)
  }

  function aggLogs ({ query, limit }, nextPageToken) {
    return events.search({ query, limit, aggregate: true }, nextPageToken, authState.username, authState.password)
  }

  const update = {
    lifecycle: setLifecycle,
    commands: setCommands,
    guests: setGuests,
    dispatches: setDispatches,
    transfers: setTransfers,
    playlists: setPlaylists,
    connections: setConnections,
    errors: setErrors,
    playlistName: setPlaylistName,
    from: setFrom,
    to: setTo
  }
  function refresh () {
    getLogs()
    aggregateLogs()
  }
  function getQuery () {
    const query = {}
    const $and = []
    if (playlistName) {
      $and.push({ party: playlistName })
    }
    if (!lifecycle) {
      $and.push({ name: { $nin: lifecycleEvents } })
    }
    if (!commands) {
      $and.push({ name: { $nin: commandEvents } })
    }
    if (!guests) {
      $and.push({ name: { $nin: guestEvents } })
    }

    if (!dispatches) {
      $and.push({ name: { $nin: dispatchEvents } })
    }
    if (!transfers) {
      $and.push({ name: { $nin: transferEvents } })
    }
    if (!playlists) {
      $and.push({ name: { $nin: playlistEvents } })
    }
    if (!connections) {
      $and.push({ name: { $nin: connectionEvents } })
    }
    if (!errors) {
      $and.push({ name: { $nin: errorEvents } })
    }
    if (from || to) {
      const timeConstraints = {}
      if (from) {
        timeConstraints.$gte = from
      }
      if (to) {
        timeConstraints.$lte = to
      }
      $and.push({ _id: timeConstraints })
    }
    if ($and.length > 0) {
      if ($and.length === 1) {
        Object.assign(query, $and[0])
      } else {
        query.$and = $and
      }
    }
    return query
  }
  function getLogs () {
    const query = getQuery()
    console.log('log query', JSON.stringify(query, null, 2))
    findLogs({ query: JSON.stringify(query), limit: 1000 }).then(({ items }) => {
      if (items.length > 0) {
        setLogs(items)
      } else {
        setLogs([])
      }
    })
  }
  function aggregateLogs () {
    const query = []
    query.push({ $match: getQuery() })
    query.push({
      $group: {
        _id: { month: { $month: '$_id' }, day: { $dayOfMonth: '$_id' }, year: { $year: '$_id' } },
        count: { $sum: 1 }
      }
    })
    console.log('AGG query', JSON.stringify(query, null, 2))
    aggLogs({ query: JSON.stringify(query), limit: 1000 }).then(({ items }) => {
      console.log('AGG items', items)
      if (items.length > 0) {
        setAggs(items)
      } else {
        setAggs([])
      }
    })
  }
  return (
    <div
      className='timelinePage'
      onChange={(event) => {
        switch (event.target.name) {
          case 'interest':
            update[event.target.value](event.target.checked)
            global.setTimeout(() => {
              refresh()
            }, 10)
            break
          case 'playlistName':
          case 'from':
          case 'to':
            update[event.target.name](event.target.value)
            break
          default:
            console.warn('unknown', event.target.name)
        }
      }}
      onKeyPress={(event) => {
        if (event.key === 'Enter' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
          refresh()
        }
      }}
    >
      <Head title="Crowd's Play | Timeline" />
      <style jsx global>{`
        ${resetStyles}

        ${baseStyles}
      `}</style>
      <style jsx>{`
        .header {
          font-size: xx-large;
          margin: 20px;
        }
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
        .interest, .filters, .timespan, .buttons {
          padding: 10px;
          background: ${colors.textBg};
          input {
            margin: 10px;
          }
        }
        .searchButton {
          border-color: ${colors.primaryText};
          color: ${colors.primaryText};
          background: ${colors.primaryBg};
        }
      `}</style>
      <img key='bgImg' className='bgImg' src='/static/bg.svg' alt='Blue gradient' />
      <div className='page'>
        <AuthForm dispatch={authDispatch} className='authForm' />
        <h2 className='header'>Timeline</h2>
        <section className='interest'>
          <label><input type='checkbox' name='interest' value='lifecycle' defaultChecked={lifecycle} />lifecycle</label>
          <label><input type='checkbox' name='interest' value='commands' defaultChecked={commands} />commands</label>
          <label><input type='checkbox' name='interest' value='guests' defaultChecked={guests} />guests</label>
          <label><input type='checkbox' name='interest' value='dispatches' defaultChecked={dispatches} />dispatches</label>
          <label><input type='checkbox' name='interest' value='transfers' defaultChecked={transfers} />transfers</label>
          <label><input type='checkbox' name='interest' value='playlists' defaultChecked={playlists} />playlists</label>
          <label><input type='checkbox' name='interest' value='connections' defaultChecked={connections} />connections</label>
          <label><input type='checkbox' name='interest' value='errors' defaultChecked={errors} />errors</label>
        </section>
        <section className='filters'>
          <label>Playlist Name: <input type='text' name='playlistName' /></label>
        </section>
        <section className='timespan'>
          <label>from: <input type='text' name='from' defaultValue={from} /></label>
          <label>to: <input type='text' name='to' defaultValue={to} /></label>
          <Heatmap
            startDate={from}
            endDate={to}
            items={aggs}
          />
        </section>
        <section className='buttons'>
          <button className='searchButton' onClick={(event) => {
            refresh()
          }}>Search</button>
        </section>
        <section className='hits'>
          <List items={logs} defaultComponent={Log} />
        </section>
      </div>
    </div>
  )
}

export default Timeline
