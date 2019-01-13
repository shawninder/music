import 'core-js/es6/string.js' // for startsWith

import qs from 'querystring'
import Clipboard from 'clipboard'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash.debounce'
import get from 'lodash.get'
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
    this.setUrlName = this.setUrlName.bind(this)
    this.debouncedSetUrlName = debounce(this.setUrlName, 1000, { maxWait: 2000 }).bind(this)
    this.button = null
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
    if (this.state.checkingName) {
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

  busy (event) {
    console.log('busy (TODO)')
    // TODO
  }

  render () {
    let title = this.props.dict.get('party.default')
    const partying = (this.props.hosting || this.props.attending) && this.props.socket.connected
    let label = 'buttonDefault'
    if (this.props.name !== '') {
      if (partying) {
        if (this.props.hosting) {
          title = `${this.props.dict.get('party.hosting')}`
          label = 'stop'
        } else {
          title = `${this.props.dict.get('party.attending')} "${this.props.name}"`
          label = 'leave'
        }
      } else {
        if (this.state.checkingName) {
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
    const copyLinkClasses = ['copyLink']
    return (
      <div
        className={classes.join(' ')}
        onClick={(event) => {
          event.stopPropagation() // Avoid dismissing dialog when clicking inside it
        }}
      >
        {
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
            <button className='partyBtn' disabled={!isServer && (this.state.checkingName || this.props.name === '')}
              onClick={this.onSubmit}
              ref={(el) => {
                this.button = el
                this.props.onButtonRef(el)
              }}
              key='notCopyLinkBtnAtAll'
            >
              {
                this.props.dict.get(`party.${label}`)
              }
            </button>
            <p className={copyLinkClasses.join(' ')}>
              {this.props.dict.get('party.copyLinkPrefix')}
              <span
                className='copyLink-url'
                ref={(el) => {
                  this.copyLink = el
                }}
              >
                {global.location && global.location.href}
              </span>
              <a
                className='copyBtn'
                ref={(el) => {
                  this.copyBtn = el
                }}
                key='copyLinkBtnMuthaFucka'
              >
                {this.props.dict.get('party.copyBtn')}
              </a>
            </p>
          </form>
        }
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
  { name: 'onButtonRef', type: PropTypes.func, val: () => {} },
  { name: 'linkedPartyName', type: PropTypes.string, val: '' },
  { name: 'notice', type: PropTypes.func, val: console.log }
]

Party.defaultProps = defaultProps(props)
Party.propTypes = propTypes(props)

export default Party

function Pulser (pulse) {
  return {
    delay: 30000,
    start: function (delay) {
      this.timestamp = Date.now()
      this.timeout = global.setTimeout(() => {
        pulse()
        this.start(this.delay)
      }, delay || this.delay)
    },
    stop: function () {
      if (this.timeout) {
        global.clearTimeout(this.timeout)
      }
      if (this.timestamp) {
        this.timestamp = null
      }
    },
    setDelay: function (newDelay) {
      if (this.timeout && this.timestamp) {
        global.clearTimeout(this.timeout)
        const now = Date.now()
        const diff = now - this.timestamp

        if (diff > newDelay) {
          pulse()
          this.start(newDelay)
        } else {
          this.start(newDelay - diff)
        }
      } else {
        this.start(newDelay)
      }
      this.delay = newDelay
    }
  }
}
