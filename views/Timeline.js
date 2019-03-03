import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import Head from '../components/Head'
import AuthForm from '../components/AuthForm'
import Heatmap from '../components/Heatmap'

import List from '../components/List'
import Log from '../components/Log'

import resetStyles from '../styles/reset'
import baseStyles from '../styles/base'
import colors from '../styles/colors'
import lengths from '../styles/lengths'

// const isServer = typeof window === 'undefined'

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

class Timeline extends Component {
  constructor (props) {
    super(props)
    this.loadMode = this.getLogs.bind(this)

    this.state = {
      lifecycle: true,
      commands: false,
      guests: true,
      dispatches: false,
      transfers: false,
      playlists: true,
      connections: false,
      errors: true,
      playlistName: '',
      minGuests: 0,
      maxGuests: 0,
      from: moment().subtract(2, 'months').startOf('month').format('YYYY-MM-DD'),
      to: moment().endOf('month').format('YYYY-MM-DD'),
      items: []
    }
  }
  getLogs () {
    const query = {}
    const $and = []
    if (this.state.playlistName) {
      $and.push({ party: this.state.playlistName })
    }
    if (!this.state.lifecycle) {
      $and.push({ name: { $nin: lifecycleEvents } })
    }
    if (!this.state.commands) {
      $and.push({ name: { $nin: commandEvents } })
    }
    if (!this.state.guests) {
      $and.push({ name: { $nin: guestEvents } })
    }

    if (!this.state.dispatches) {
      $and.push({ name: { $nin: dispatchEvents } })
    }
    if (!this.state.transfers) {
      $and.push({ name: { $nin: transferEvents } })
    }
    if (!this.state.playlists) {
      $and.push({ name: { $nin: playlistEvents } })
    }
    if (!this.state.connections) {
      $and.push({ name: { $nin: connectionEvents } })
    }
    if (!this.state.errors) {
      $and.push({ name: { $nin: errorEvents } })
    }
    if (this.state.from || this.state.to) {
      const timeConstraints = {}
      if (this.state.from) {
        timeConstraints.$gte = this.state.from
      }
      if (this.state.to) {
        timeConstraints.$lte = this.state.to
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
    console.log('query object', JSON.stringify(query, null, 2))
    this.props.findLogs({ query: JSON.stringify(query), limit: 1000 }).then(({ items }) => {
      if (items.length > 0) {
        this.setState({ items })
      } else {
        this.setState({ items: [] })
      }
    })
  }
  render () {
    return (
      <div
        className='timelinePage'
        onChange={(event) => {
          switch (event.target.name) {
            case 'interest': {
              const update = {}
              update[event.target.value] = event.target.checked
              this.setState(update)
              setTimeout(() => {
                this.getLogs()
              }, 10)
              break
            }
            case 'playlistName':
            case 'minGuests':
            case 'maxGuests':
            case 'from':
            case 'to': {
              const update = {}
              update[event.target.name] = event.target.value
              this.setState(update)
              break
            }
            default:
              console.warn('unknown', event.target.name)
          }
        }}
        onKeyPress={(event) => {
          if (event.key === 'Enter' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
            this.getLogs()
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
          .heatmap {
            max-height: ${lengths.menuWidth};
          }
          .searchButton {
            border-color: ${colors.primaryText};
            color: ${colors.primaryText};
            background: ${colors.primaryBg};
          }
        `}</style>
        <img key='bgImg' className='bgImg' src='/static/bg.svg' alt='Blue gradient' />
        <div className='page'>
          <AuthForm dispatch={this.props.dispatch} className='authForm' />
          <h2 className='header'>Timeline</h2>
          <section className='interest'>
            <label><input type='checkbox' name='interest' value='lifecycle' defaultChecked={this.state.lifecycle} />lifecycle</label>
            <label><input type='checkbox' name='interest' value='commands' defaultChecked={this.state.commands} />commands</label>
            <label><input type='checkbox' name='interest' value='guests' defaultChecked={this.state.guests} />guests</label>
            <label><input type='checkbox' name='interest' value='dispatches' defaultChecked={this.state.dispatches} />dispatches</label>
            <label><input type='checkbox' name='interest' value='transfers' defaultChecked={this.state.transfers} />transfers</label>
            <label><input type='checkbox' name='interest' value='playlists' defaultChecked={this.state.playlists} />playlists</label>
            <label><input type='checkbox' name='interest' value='connections' defaultChecked={this.state.connections} />connections</label>
            <label><input type='checkbox' name='interest' value='errors' defaultChecked={this.state.errors} />errors</label>
          </section>
          <section className='filters'>
            <label>Playlist Name: <input type='text' name='playlistName' /></label>
          </section>
          <section className='timespan'>
            <label>from: <input type='text' name='from' defaultValue={this.state.from} /></label>
            <label>to: <input type='text' name='to' defaultValue={this.state.to} /></label>
            <Heatmap
              className='heatmap'
              startDate={this.state.from}
              endDate={this.state.to}
              items={this.state.items}
            />
          </section>
          <section className='buttons'>
            <button className='searchButton' onClick={(event) => {
              this.getLogs()
            }}>Search</button>
          </section>
          <section className='hits'>
            <List items={this.state.items} defaultComponent={Log} />
          </section>
        </div>
      </div>
    )
  }
}

const props = [
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'findLogs', type: PropTypes.func.isRequired }
]

Timeline.defaultProps = defaultProps(props)
Timeline.propTypes = propTypes(props)

export default Timeline
