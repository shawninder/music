import React, { Component } from 'react'
import PropTypes from 'prop-types'

import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

const isServer = typeof window === 'undefined'

class Party extends Component {
  constructor (props) {
    super(props)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.startListening = this.startListening.bind(this)
    this.stopListening = this.stopListening.bind(this)
    this.middleware = this.middleware.bind(this)
    this.join = this.join.bind(this)
    this.start = this.start.bind(this)
    this.leave = this.leave.bind(this)
    this.stop = this.stop.bind(this)
    this.busy = this.busy.bind(this)
    this.hydrate = this.hydrate.bind(this)
    this.checkPartyName = this.checkPartyName.bind(this)
    this.onGlobalFocus = this.onGlobalFocus.bind(this)
  }

  componentDidMount () {
    this.startListening()
    this.hydrate()
  }

  componentWillUnmount () {
    this.stopListening()
  }

  checkPartyName (providedName) {
    const name = providedName || this.props.name
    if (name !== '') {
      if (this.props.socket.connected && !this.props.checking) {
        const emitting = {
          reqName: 'isParty',
          socketKey: this.props.socketKey,
          name
        }
        const onResponse = (res) => {
          console.log('check party name response', res)
          if (res.name === name && name === this.props.name) {
            this.props.dispatch({
              type: 'Party:exists',
              value: res.exists
            })
          }
          this.props.dispatch({
            type: 'Party:checking',
            value: false
          })
        }
        this.props.dispatch({
          type: 'Party:checking',
          value: true
        })
        this.socketRequest(emitting, onResponse)
      } else {
        console.log("Can't check party name: this.props.socket.connected", this.props.socket.connected, 'this.props.checking', this.props.checking)
      }
    }
  }

  onChange (event) {
    const value = event.target.value
    this.props.dispatch({
      type: 'Party:setName',
      value
    })
    if (value !== '') {
      this.checkPartyName(value)
    }
  }

  onKeyDown (event) {
    // if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // enter
    //   event.preventDefault()
    //   this.party(event)
    // }
    // TODO Remove need for this in the app, perhaps by listening on an element rather than the window...
    if (event.keyCode === 39 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // right
      event.stopPropagation()
    }
    // TODO Remove need for this in the app, perhaps by listening on an element rather than the window...
    if (event.keyCode === 37 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // left
      event.stopPropagation()
    }
  }
  onSubmit (event) {
    event.preventDefault()
    if (this.props.checking) {
      this.busy(event)
    } else {
      if (this.props.hosting) {
        this.stop(event)
      } else if (this.props.attending) {
        this.leave(event)
      } else if (this.props.exists) {
        this.join(event)
      } else {
        this.start(event)
      }
    }
  }

  hydrate () {
    // TODO replay events missed during loading, if any?
    if (this.props.hosting || this.props.attending) {
      this.reconnect()
    } else {
      this.checkPartyName()
    }
  }

  middleware (action) {
    if (this.props.attending && (action.type.startsWith('Player:') || action.type.startsWith('Queue:'))) {
      console.log('Intercepting', action)
      const emitting = {
        ...action,
        socketKey: this.props.socketKey,
        name: this.props.name,
        as: 'guest'
      }
      this.props.socket.emit('dispatch', emitting)
      console.log('emitted', emitting)
      return true
    } else {
      console.log('Letting this one go through', action)
      return false
    }
  }

  onGlobalFocus () {
    // this.hydrate()
  }

  // Object.keys(data.state).forEach((key) => {
  //   parties[data.name].state[key] = data.state[key]
  // })
  // client.emit('success')
  // Object.keys(parties[data.name].guests).forEach((guestKey) => {
  //   parties[data.name].guests[guestKey].emit('state', data.state)
  // })

  startListening () {
    this.props.registerMiddleware(this.middleware)

    if (window) {
      window.addEventListener('focus', this.onGlobalFocus, false)
    }

    this.props.socket.on('connect', () => {
      console.log('SOCKET connect')
      this.props.dispatch({
        type: 'Party:connected',
        value: true
      })
      this.checkPartyName()
    })

    this.props.socket.on('connect_error', () => {
      console.log('SOCKET connect_error')
      this.props.dispatch({
        type: 'Party:connected',
        value: false
      })
    })

    this.props.socket.on('reconnect_failed', () => {
      console.log('SOCKET reconnect_failed')
      this.props.dispatch({
        type: 'Party:connected',
        value: false
      })
    })

    this.props.socket.on('disconnect', () => {
      console.log('SOCKET disconnect')
      this.props.dispatch({
        type: 'Party:connected',
        value: false
      })
    })

    this.props.socket.on('err', (data) => {
      console.log('data', data)
    })

    this.props.socket.on('state', (state) => {
      console.log('SOCKET state')
      if (this.props.attending) {
        this.props.dispatch({
          type: 'Party:gotState',
          state
        })
      }
    })

    this.props.socket.on('slice', (slice) => {
      console.log('SOCKET slice')
      if (this.props.attending) {
        this.props.dispatch({
          type: 'Party:gotSlice',
          slice
        })
      }
    })

    this.props.socket.on('dispatch', (action) => {
      this.props.dispatch(action)
    })

    this.props.socket.on('*', function () {
      console.log('SOCKET Unknown REMOTE EVENT', arguments)
    })
  }

  stopListening () {
    this.props.unregisterMiddleware(this.middleware)

    if (window) {
      window.removeEventListener('focus', this.onGlobalFocus, false)
    }

    // TODO test that this really removes all listeners of all events
    this.props.socket.off()
    this.props.socket.close()
  }

  socketRequest (request, onRes) {
    const reqId = Math.random()
    request.reqId = reqId
    const fn = ({ req, res, err }) => {
      if (req.reqId === reqId) {
        this.props.socket.off('response', fn)
        if (err) {
          this.props.dispatch({
            type: 'Party:failed',
            err
          })
        } else {
          onRes(res)
        }
      }
    }
    this.props.socket.on('response', fn)
    this.props.socket.emit('request', request)
    console.log('emitted request', request)
  }

  reconnect () {
    const emitting = {
      reqName: 'reconnect',
      socketKey: this.props.socketKey,
      name: this.props.name,
      hosting: this.props.hosting,
      attending: this.props.attending,
      state: this.props.state
    }
    const onResponse = (res) => {
      this.props.dispatch({
        type: 'Party:reconnected',
        res
      })
    }
    this.socketRequest(emitting, onResponse)
  }

  start (event) {
    console.log('START')

    const emitting = {
      reqName: 'startParty',
      socketKey: this.props.socketKey,
      name: this.props.name,
      state: this.props.state
    }
    const onResponse = (res) => {
      this.props.dispatch({
        type: 'Party:started',
        res
      })
    }
    this.socketRequest(emitting, onResponse)
  }

  stop (event) {
    const emitting = {
      reqName: 'stopParty',
      socketKey: this.props.socketKey,
      name: this.props.name
    }
    const onResponse = (res) => {
      this.props.dispatch({
        type: 'Party:stopped',
        res
      })
      this.props.dispatch({
        type: 'Party:scrambleSocketKey'
      })
    }
    this.socketRequest(emitting, onResponse)
  }

  join (event) {
    const emitting = {
      reqName: 'joinParty',
      socketKey: this.props.socketKey,
      name: this.props.name
    }
    const onResponse = (res) => {
      this.props.dispatch({
        type: 'Party:joined',
        res
      })
    }
    this.socketRequest(emitting, onResponse)
  }

  leave (event) {
    const emitting = {
      reqName: 'leaveParty',
      socketKey: this.props.socketKey,
      name: this.props.name
    }
    const onResponse = (res) => {
      this.props.dispatch({
        type: 'Party:left',
        res
      })
    }
    this.socketRequest(emitting, onResponse)
  }

  busy (event) {
    console.log('busy (TODO)')
    // TODO
  }

  render () {
    let title = 'Party!'
    const partying = (this.props.hosting || this.props.attending) && this.props.socket.connected
    let label = 'default'
    if (this.props.name !== '') {
      if (partying) {
        if (this.props.hosting) {
          title = this.props.dict.get('party.hosting')
          label = 'stop'
        } else {
          title = this.props.dict.get('party.attending')
          label = 'leave'
        }
      } else {
        if (this.props.checking) {
          label = 'checking'
        } else {
          if (this.props.exists) {
            label = 'join'
          } else {
            label = 'start'
          }
        }
      }
    }
    const classes = this.props.className.split(' ')
    classes.push(this.props.socket.connected ? 'connected' : 'disconnected')
    if (this.props.hosting) {
      classes.push('hosting')
    }
    if (this.props.attending) {
      classes.push('attending')
    }
    return (
      <div className={classes.join(' ')}>
        <form onSubmit={this.onSubmit}>
          <h3>
            {title}
          </h3>
          <input
            type='text'
            placeholder={this.props.placeholder}
            autoFocus={this.props.autoFocus}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            disabled={partying}
            ref={(ref) => {
              // Using this instead of defaultValue since the initial render is done on the server where we don't have this value yet
              if (ref) {
                ref.value = this.props.name
              }
            }}
          />
          <button disabled={!isServer && (this.props.checking || this.props.name === '')} onClick={this.onSubmit}>{
            this.props.dict.get(`party.${label}`)
          }</button>
        </form>
      </div>
    )
  }
}

const props = [
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'placeholder', type: PropTypes.string, val: '' },
  { name: 'dict', type: PropTypes.object.isRequired },
  { name: 'name', type: PropTypes.string.isRequired },
  { name: 'checking', type: PropTypes.bool.isRequired },
  { name: 'exists', type: PropTypes.bool.isRequired },
  { name: 'attending', type: PropTypes.bool.isRequired },
  { name: 'hosting', type: PropTypes.bool.isRequired },
  { name: 'registerMiddleware', type: PropTypes.func.isRequired },
  { name: 'unregisterMiddleware', type: PropTypes.func.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired }
]

Party.defaultProps = defaultProps(props)
Party.propTypes = propTypes(props)

export default Party
