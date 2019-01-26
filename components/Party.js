import 'core-js/es6/string.js' // for startsWith

import qs from 'querystring'
import Clipboard from 'clipboard'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'
import get from 'lodash.get'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'
import Pulser from '../helpers/Pulser'

import colors from '../styles/colors'
import tfns from '../styles/timing-functions'

const isServer = typeof window === 'undefined'

class Party extends Component {
  constructor (props) {
    super(props)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onStart = this.onStart.bind(this)
    this.onJoin = this.onJoin.bind(this)
    this.startListening = this.startListening.bind(this)
    this.stopListening = this.stopListening.bind(this)
    this.middleware = this.middleware.bind(this)
    this.join = this.join.bind(this)
    this.start = this.start.bind(this)
    this.leave = this.leave.bind(this)
    this.stop = this.stop.bind(this)
    this.hydrate = this.hydrate.bind(this)
    this.checkPartyName = this.checkPartyName.bind(this)
    this.onGlobalFocus = this.onGlobalFocus.bind(this)
    this.setUrlName = this.setUrlName.bind(this)
    this.debouncedSetUrlName = debounce(this.setUrlName, 1000, { maxWait: 2000 }).bind(this)
    this.joinButton = null
    this.startButton = null
    this.pulse = new Pulser(() => {
      if (global.document.hasFocus()) {
        // TODO on hydrate if document didn't have focus at last pulse?
        this.hydrate()
      }
    })
    this.state = {
      checkingName: false
    }
  }

  componentDidMount () {
    this.startListening()
    this.hydrate()
    this.clipboard = new Clipboard(this.copyBtn, {
      target: () => {
        return this.copyLink
      }
    })
    this.clipboard.on('success', (event) => {
      // event.clearSelection()
      this.props.notify({
        id: `party.linkCopied${Math.random()}`,
        body: this.props.dict.get('party.linkCopied'),
        duration: 1500
      })
    })
    this.clipboard.on('error', (event) => {
      console.error('Clipboard error', event)
      // TODO
    })
    if (this.props.linkedPartyName) {
      this.props.dispatch({ type: 'App:showParty' })
    }
  }

  componentWillUnmount () {
    this.stopListening()
    this.clipboard.destroy()
  }

  checkPartyName (providedName) {
    const name = providedName || this.props.name || this.props.linkedPartyName
    if (name !== '') {
      if (this.props.socket.connected && !this.state.checkingName) {
        const emitting = {
          reqName: 'isParty',
          socketKey: this.props.socketKey,
          name
        }
        const onResponse = (res) => {
          if (res.name === name && (name === this.props.name || name === this.props.linkedPartyName)) {
            this.props.dispatch({
              type: 'Party:exists',
              value: res.exists
            })
          }
          // TODO Make sure we're always showing the correct "checkingName" status
          this.setState({
            checkingName: false
          })
        }
        this.setState({
          checkingName: true
        })
        this.socketRequest(emitting, onResponse)
      } else {
        console.log("Can't check party name: this.props.socket.connected", this.props.socket.connected, 'this.state.checkingName', this.state.checkingName)
      }
    }
  }

  setUrlName (value) {
    const currentQS = qs.parse(global.location.search.slice(1))
    currentQS.name = value
    if (currentQS.name === '') {
      delete currentQS.name
    }
    const str = qs.stringify(currentQS)
    const search = str === '' ? '' : `?${str}`
    if (search !== global.location.search) {
      const newRelativePathQuery = `${global.location.pathname}${search}`
      global.history.replaceState(null, '', newRelativePathQuery)
    }
  }

  onChange (event) {
    const value = event.target.value
    this.props.dispatch({
      type: 'Party:setName',
      value
    })
    this.debouncedSetUrlName(value) // We need to avoid hitting the 100 calls per 30 seconds placed on history.replaceState() by at least Safari on mobile
    if (value !== '') {
      this.checkPartyName(value)
    }
  }

  onKeyDown (event) {
    if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // enter
      event.preventDefault()
      this.onSubmit(event)
    }
    if (event.keyCode === 27 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // esc
      event.preventDefault()
      this.props.dispatch({ type: 'App:collapseParty' })
    }
  }

  onSubmit (event) {
    event.preventDefault()
    const ok = !isServer &&
      this.props.socket.connected &&
      !(
        this.state.checkingName ||
        this.props.name === '' ||
        this.props.name === null
      )
    if (ok) {
      if (this.props.exists) {
        if (this.props.attending) {
          this.leave(event)
        } else if (this.props.hosting) {
          this.stop(event)
        } else {
          this.join(event)
        }
      } else {
        this.start(event)
      }
    }
  }

  onJoin (event) {
    event.preventDefault()
    const ok = !isServer &&
      this.props.socket.connected &&
      this.props.exists &&
      !(
        this.state.checkingName ||
        this.props.name === '' ||
        this.props.name === null ||
        this.props.hosting
      )
    if (ok) {
      if (this.props.attending) {
        this.leave(event)
      } else {
        this.join(event)
      }
    }
  }

  onStart (event) {
    event.preventDefault()
    const ok = !isServer &&
      this.props.socket.connected &&
      !(
        this.state.checkingName ||
        this.props.name === '' ||
        this.props.name === null ||
        this.props.attending
      )
    if (ok) {
      if (this.props.hosting) {
        this.stop(event)
      } else if (this.props.exists) {
        this.props.notify({ id: Math.random().toString(), body: 'Party already exists...', duration: 5000 })
      } else {
        this.start(event)
      }
    }
  }

  hydrate () {
    // TODO? replay events missed during loading, if any
    this.reconnect()
    if (!this.props.hosting && !this.props.attending && !this.props.linkedPartyName) {
      this.checkPartyName()
    }
  }

  middleware (action) {
    if (this.props.attending && (action.type.startsWith('Player:') || action.type.startsWith('Queue:'))) {
      const emitting = {
        ...action,
        socketKey: this.props.socketKey,
        name: this.props.name,
        as: 'guest'
      }
      this.props.socket.emit('dispatch', emitting)
      return true
    } else {
      return false
    }
  }

  onGlobalFocus () {
    this.hydrate()
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

    this.pulse.start(30000)

    this.props.socket.on('connect', () => {
      console.log('SOCKET connect')
      this.pulse.setDelay(30000)
      this.props.dispatch({
        type: 'Party:connected',
        value: true
      })
      this.checkPartyName()
    })

    this.props.socket.on('connect_error', () => {
      console.log('SOCKET connect_error')
      this.pulse.setDelay(1000)
      this.props.dispatch({
        type: 'Party:connected',
        value: false
      })
    })

    this.props.socket.on('reconnect_failed', () => {
      this.pulse.setDelay(1000)
      console.log('SOCKET reconnect_failed')
      this.props.dispatch({
        type: 'Party:connected',
        value: false
      })
    })

    this.props.socket.on('disconnect', () => {
      console.log('SOCKET disconnect')
      this.pulse.setDelay(1000)
      this.props.dispatch({
        type: 'Party:connected',
        value: false
      })
    })

    this.props.socket.on('err', (errData) => {
      console.error('SOCKET ERROR', errData, this.props.pending)
      const origin = get(errData, 'data.origin', false)
      if (origin) {
        const trackId = get(errData, 'data.data.key', false)
        if (trackId) {
          const pendings = this.props.pending[trackId]
          if (pendings) {
            if (pendings[origin]) {
              this.props.dispatch({
                type: 'Ack:removePending',
                data: errData.data.data,
                origin: errData.data.origin
              })
            }
          }
        }
        this.props.notify({ id: origin, body: errData.msg.name, duration: 5000 })
      } else {
        this.props.notify({ id: `${errData.msg.name}`, body: errData.msg.name, duration: 5000 })
      }
    })

    this.props.socket.on('state', (state) => {
      console.log('SOCKET state')
      if (this.props.attending) {
        this.props.gotState(state)
      }
    })

    this.props.socket.on('slice', (slice) => {
      console.log('SOCKET slice')
      if (this.props.attending) {
        this.props.gotSlice(slice)
      }
    })

    this.props.socket.on('dispatch', (action) => {
      this.props.gotDispatch(action)
    })

    this.props.socket.on('file-transfer-chunk', (msg) => {
      if (this.props.hosting) {
        this.props.gotFileChunk(msg)
      }
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

    this.pulse.stop()

    // TODO test that this really removes all listeners of all events
    this.props.socket.removeAllListeners()
    this.props.socket.off()
    this.props.socket.close()
  }

  socketRequest (request, onRes) {
    const reqId = Math.random().toString().slice(2)
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
      state: {
        player: this.props.player,
        queue: this.props.queue
      }
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
    const emitting = {
      reqName: 'startParty',
      socketKey: this.props.socketKey,
      name: this.props.name,
      state: {
        player: this.props.player,
        queue: this.props.queue
      }
    }
    const onResponse = (res) => {
      this.props.dispatch({
        type: 'Party:started',
        res
      })
      if (this.button) {
        this.button.focus()
      }
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
      if (this.field) {
        this.field.focus()
      }
    }
    this.socketRequest(emitting, onResponse)
  }

  join (event) {
    const emitting = {
      reqName: 'joinParty',
      socketKey: this.props.socketKey,
      name: this.props.name || this.props.linkedPartyName
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

  render () {
    const ok = !isServer &&
      this.props.socket.connected &&
      !(
        this.state.checkingName ||
        this.props.name === '' ||
        this.props.name === null
      )
    const partying = (this.props.hosting || this.props.attending) && ok
    const classes = this.props.className ? this.props.className.split(' ') : []
    if (this.props.collapsed) {
      classes.push('collapsed')
    } else {
      classes.push('not-collapsed')
    }
    classes.push(this.props.socket.connected ? 'connected' : 'disconnected')
    if (this.props.hosting) {
      classes.push('hosting')
    }
    if (this.props.attending) {
      classes.push('attending')
    }

    const canJoin = ok && this.props.exists
    const canStart = ok && !this.props.exists
    const joinBtnClasses = ['joinBtn']
    const startBtnClasses = ['startBtn']
    const copyLinkClasses = ['copyButton']
    if (canJoin) {
      joinBtnClasses.push('enabled')
    }
    if (canStart) {
      startBtnClasses.push('enabled')
    }
    if (this.props.hosting || this.props.attending) {
      copyLinkClasses.push('enabled')
    }
    return (
      <div
        className={classes.join(' ')}
      >
        {
          <form onSubmit={this.onSubmit}>
            <input
              type='text'
              placeholder={this.props.placeholder}
              autoFocus={this.props.autoFocus && ok && !partying}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              disabled={partying}
              ref={(ref) => {
                // Using `ref.value` instead of `defaultValue=` since the initial render is done on the server where we don't have this value yet
                if (ref) {
                  if (!this.props.name && this.props.name !== '' && this.props.linkedPartyName) {
                    ref.value = this.props.linkedPartyName
                  } else {
                    ref.value = this.props.name
                  }
                  this.debouncedSetUrlName(ref.value)
                }
                this.field = ref
                this.props.onFieldRef(ref)
              }}
            />
            <button
              className={joinBtnClasses.join(' ')}
              // disabled={!canJoin}
              onClick={this.onJoin}
              key='joinBtn'
            >
              {
                this.props.attending
                  ? this.props.dict.get('party.leave')
                  : this.props.dict.get('party.join')
              }
            </button>
            <button
              className={startBtnClasses.join(' ')}
              // disabled={!canStart}
              onClick={this.onStart}
              key='startBtn'
            >
              {
                this.props.hosting
                  ? this.props.dict.get('party.stop')
                  : this.props.dict.get('party.start')
              }
            </button>
            <p className={copyLinkClasses.join(' ')}>
              {this.props.dict.get('party.copyLinkPrefix')}
              <a
                className='copyBtn'
                ref={(el) => {
                  this.copyBtn = el
                }}
                key='copyBtn'
              >
                {this.props.dict.get('party.copyBtn')}
              </a>
            </p>
          </form>
        }
        <style jsx>{`
          .autoparty {
            max-width: 640px;
            margin: 0 auto;
          }

          .autoparty.disconnected .partyBtn, .autoparty:disabled {
            color: ${colors.grey};
          }

          .autoparty input {
            display: block;
            width: 100%;
            padding: 5px;
            font-size: xx-large;
            line-height: 2em;
            text-align: center;
            border-radius: 0;
          }

          .autoparty button, .autoparty .copyBtn {
            padding: 5px;
            font-size: medium;
            line-height: 1.5em;
            color: ${colors.black};
            background-color: ${colors.whitesmoke};
            &.enabled {
              background-color: ${colors.aqua};
            }
          }

          .joinBtn, .startBtn {
            width: 50%;
            cursor: pointer;
            opacity: 1;
            transition-property: opacity, background-color;
            transition-duration: 0.1s;
            transition-timing-function: ${tfns.easeInOutQuad};
          }

          .copyButton {
            padding: 5px;
            font-size: medium;
            line-height: 1.5em;
            text-align: right;
            /* font-weight: bold; */
            opacity: 0;
            transition-property: opacity;
            transition-duration: 0.1s;
            transition-timing-function: ${tfns.easeInOutQuad};
          }

          .copyBtn {
            cursor: pointer;
            background-color: ${colors.white};
            display: inline-block; /* TODO Consider setting this in the reset styles */
            transform: translateX(5px); /* Cancels .copyButton padding to align with other inputs */
            transition-property: background-color;
            transition-duration: 0.1s;
            transition-timing-function: ${tfns.easeInOutQuad};
          }
        `}</style>
      </div>
    )
  }
}

const props = [
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'placeholder', type: PropTypes.string, val: '' },
  { name: 'dict', type: PropTypes.object.isRequired },
  { name: 'name', type: PropTypes.string, val: '' },
  { name: 'exists', type: PropTypes.bool.isRequired },
  { name: 'attending', type: PropTypes.bool.isRequired },
  { name: 'hosting', type: PropTypes.bool.isRequired },
  { name: 'registerMiddleware', type: PropTypes.func.isRequired },
  { name: 'unregisterMiddleware', type: PropTypes.func.isRequired },
  { name: 'dispatch', type: PropTypes.func.isRequired },
  { name: 'socketKey', type: PropTypes.string.isRequired },
  { name: 'collapsed', type: PropTypes.bool.isRequired },
  { name: 'onFieldRef', type: PropTypes.func, val: () => {} },
  { name: 'linkedPartyName', type: PropTypes.string, val: '' },
  { name: 'notice', type: PropTypes.func, val: console.log }
]

Party.defaultProps = defaultProps(props)
Party.propTypes = propTypes(props)

export default Party
