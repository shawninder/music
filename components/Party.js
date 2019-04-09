import qs from 'querystring'

import React, { useMemo, useState, useEffect, useRef, useContext } from 'react'
import PropTypes from 'prop-types'

import debounce from 'lodash.debounce'
import get from 'lodash.get'
import defaultProps from '../helpers/defaultProps'
import propTypes from '../helpers/propTypes'

import colors from '../styles/colors'
import durations from '../styles/durations'
import tfns from '../styles/timing-functions'

import stopIcon from './icons/dequeue'
import LeaveIcon from './icons/back'

import AckContext from '../features/ack/context'
import PartyContext from '../features/party/context'
import DictContext from '../features/dict/context'
import NoticeContext from '../features/notice/context'
import PlayerContext from '../features/player/context'
import QueueContext from '../features/queue/context'

import usePulse from '../features/pulse/use'

import passiveSupported from '../helpers/passiveSupported'

const listenerOptions = passiveSupported ? { passive: true, capture: false } : false

const isServer = typeof window === 'undefined'

function Party (props) {
  const { dict } = useContext(DictContext)
  const { notify } = useContext(NoticeContext)
  const { state: partyState, dispatch: partyDispatch, socket } = useContext(PartyContext)
  const { state: playerState } = useContext(PlayerContext)
  const { state: queueState } = useContext(QueueContext)
  const { dispatch: ackDispatch } = useContext(AckContext)

  const [checkingName, setCheckingName] = useState(false)

  const debouncedSetUrlName = useRef(debounce(setUrlName, 1000, { maxWait: 2000 }))
  const field = useRef(null)
  const button = useRef(null)
  const partyStateRef = useRef(partyState)
  const playerStateRef = useRef(playerState)
  const queueStateRef = useRef(queueState)

  useEffect(() => {
    partyStateRef.current = partyState
  }, [partyState])

  useEffect(() => {
    playerStateRef.current = playerState
  }, [playerState])

  useEffect(() => {
    queueStateRef.current = queueState
  }, [queueState])

  useEffect(() => {
    hydrate()
  }, [])

  useEffect(() => {
    if (!isServer) {
      global.addEventListener('focus', onGlobalFocus, listenerOptions)
      return () => {
        global.removeEventListener('focus', onGlobalFocus, listenerOptions)
      }
    }
  }, [])

  function onGlobalFocus () {
    hydrate()
  }

  const [changeDelay] = usePulse(() => {
    if (global.document.hasFocus()) {
      hydrate()
    }
  }, 10000)

  useEffect(() => {
    if (socket.connected) {
      let tid = null
      socket.on('connect', () => {
        console.log('SOCKET connect')
        changeDelay(30000)
        partyDispatch({
          type: 'Party:connected',
          value: true
        })
        // Timeout helps failing `connected` guard in checkPartyName
        tid = global.setTimeout(() => {
          checkPartyName()
        }, 10)
      })

      socket.on('connect_error', () => {
        console.log('SOCKET connect_error')
        changeDelay(1000)
        partyDispatch({
          type: 'Party:connected',
          value: false
        })
      })

      socket.on('reconnect_failed', () => {
        changeDelay(1000)
        console.log('SOCKET reconnect_failed')
        partyDispatch({
          type: 'Party:connected',
          value: false
        })
      })

      socket.on('disconnect', () => {
        console.log('SOCKET disconnect')
        changeDelay(1000)
        partyDispatch({
          type: 'Party:connected',
          value: false
        })
      })

      socket.on('err', (errData) => {
        console.error('SOCKET ERROR', errData, props.pending)
        const origin = get(errData, 'data.origin', false)
        if (origin) {
          const trackId = get(errData, 'data.data.key', false)
          if (trackId) {
            const pendings = props.pending[trackId]
            if (pendings) {
              if (pendings[origin]) {
                ackDispatch({
                  type: 'Ack:removePending',
                  data: errData.data.data,
                  origin: errData.data.origin
                })
              }
            }
          }
          notify({ id: origin, body: errData.msg.name, duration: 5000 })
        } else {
          notify({ id: `${errData.msg.name}`, body: errData.msg.name, duration: 5000 })
        }
      })

      socket.on('state', (state) => {
        console.log('SOCKET state')
        if (partyStateRef.current.attending) {
          props.gotState(state)
        }
      })

      socket.on('slice', (slice) => {
        console.log('SOCKET slice')
        console.log('partyStateRef.current.attending', partyStateRef.current.attending)
        if (partyStateRef.current.attending) {
          props.gotSlice(slice)
        }
      })

      socket.on('dispatch', (action) => {
        props.gotDispatch(action)
      })

      socket.on('file-transfer-chunk', (msg) => {
        if (partyStateRef.current.hosting) {
          props.gotFileChunk(msg)
        }
      })

      socket.on('*', function () {
        console.log('SOCKET Unknown REMOTE EVENT', arguments)
      })
      return () => {
        socket.removeAllListeners()
        socket.off()
        socket.close()
        if (tid) {
          global.clearTimeout(tid)
        }
      }
    }
  }, [socket])

  useEffect(() => {
    if (field.current) {
      if (!partyStateRef.current.name && partyStateRef.current.name !== '' && props.linkedPartyName) {
        field.current.value = props.linkedPartyName
      } else {
        field.current.value = partyStateRef.current.name
      }
      debouncedSetUrlName.current(field.current.value)
      props.onFieldRef(field.current)
    }
  }, [field])

  function socketRequest (request, onRes) {
    const reqId = Math.random().toString().slice(2)
    request.reqId = reqId
    const fn = ({ req, res, err }) => {
      if (req.reqId === reqId) {
        socket.off('response', fn)
        if (err) {
          partyDispatch({
            type: 'Party:failed',
            err
          })
        } else {
          console.log('heard response', res)
          onRes(res)
        }
      }
    }
    socket.on('response', fn)
    socket.emit('request', request)
    console.log('emitted request', request)
  }

  function reconnect () {
    const emitting = {
      reqName: 'reconnect',
      socketKey: partyStateRef.current.socketKey,
      name: partyStateRef.current.name,
      hosting: partyStateRef.current.hosting,
      attending: partyStateRef.current.attending,
      state: {
        player: playerStateRef.current,
        queue: queueStateRef.current
      }
    }
    const onResponse = (res) => {
      partyDispatch({
        type: 'Party:reconnected',
        res
      })
    }
    socketRequest(emitting, onResponse)
  }

  function onCheckPartyNameResponse (res) {
    if (res.name === field.current.value) {
      partyDispatch({
        type: 'Party:exists',
        value: res.exists
      })
    }

    // TODO Make sure we're always showing the correct "checkingName" status
    setCheckingName(false)
  }

  function checkPartyName (providedName) {
    const name = providedName || partyStateRef.current.name || props.linkedPartyName || ''
    if (name !== '') {
      if (socket.connected && !checkingName) {
        const emitting = {
          reqName: 'isParty',
          socketKey: partyStateRef.current.socketKey,
          name
        }

        setCheckingName(true)
        socketRequest(emitting, onCheckPartyNameResponse)
      } else {
        console.log("Can't check party name: socket.connected", socket.connected, 'checkingName', checkingName)
      }
    }
  }

  function hydrate () {
    // TODO? replay events missed during loading, if any
    reconnect()
    if (!partyStateRef.current.hosting && !partyStateRef.current.attending) {
      checkPartyName()
    }
  }

  function setUrlName (value) {
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

  function onChange (event) {
    const value = event.target.value
    partyDispatch({
      type: 'Party:setName',
      value
    })
    debouncedSetUrlName.current(value) // We need to avoid hitting the 100 calls per 30 seconds placed on history.replaceState() by at least Safari on mobile
    if (value !== '') {
      checkPartyName(value)
    }
  }

  function onKeyDown (event) {
    if (event.keyCode === 13 && !event.metaKey && !event.ctrlKey && !event.shiftKey) { // enter
      event.preventDefault()
      onSubmit(event)
    }
  }

  function onSubmit (event) {
    event.preventDefault()
    const ok = !isServer &&
      socket.connected &&
      !checkingName &&
      (
        !(
          props.linkedPartyName === '' ||
          props.linkedPartyName === null
        ) || !(
          partyStateRef.current.name === '' ||
          partyStateRef.current.name === null
        )
      )
    if (ok) {
      if (partyStateRef.current.exists) {
        if (partyStateRef.current.attending) {
          leave(event)
        } else if (partyStateRef.current.hosting) {
          stop(event)
        } else {
          join(event)
        }
      } else {
        start(event)
      }
    }
  }

  function onJoin (event) {
    event.preventDefault()
    const ok = !isServer &&
      socket.connected &&
      partyStateRef.current.exists &&
      !checkingName &&
      !partyStateRef.current.hosting &&
      (
        !(
          props.linkedPartyName === '' ||
          props.linkedPartyName === null
        ) || !(
          partyStateRef.current.name === '' ||
          partyStateRef.current.name === null
        )
      )
    if (ok) {
      if (partyStateRef.current.attending) {
        leave(event)
      } else {
        join(event)
      }
    }
  }

  function onStart (event) {
    event.preventDefault()
    const ok = !isServer &&
      socket.connected &&
      !checkingName &&
      !partyStateRef.current.attending &&
      (
        !(
          props.linkedPartyName === '' ||
          props.linkedPartyName === null
        ) || !(
          partyStateRef.current.name === '' ||
          partyStateRef.current.name === null
        )
      )

    if (ok) {
      if (partyStateRef.current.hosting) {
        stop(event)
      } else if (partyStateRef.current.exists) {
        notify({ id: Math.random().toString(), body: dict.get('party.exists'), duration: 5000 })
      } else {
        start(event)
      }
    }
  }

  function start (event) {
    const emitting = {
      reqName: 'startParty',
      socketKey: partyStateRef.current.socketKey,
      name: partyStateRef.current.name,
      state: {
        player: playerStateRef.current,
        queue: queueStateRef.current
      }
    }
    const onResponse = (res) => {
      partyDispatch({
        type: 'Party:started',
        res
      })
      if (button.current) {
        button.current.focus()
      }
    }
    socketRequest(emitting, onResponse)
  }

  function stop (event) {
    const emitting = {
      reqName: 'stopParty',
      socketKey: partyStateRef.current.socketKey,
      name: partyStateRef.current.name
    }
    const onResponse = (res) => {
      partyDispatch({
        type: 'Party:stopped',
        res
      })
      if (field.current) {
        field.current.focus()
      }
    }
    socketRequest(emitting, onResponse)
  }

  function join (event) {
    const emitting = {
      reqName: 'joinParty',
      socketKey: partyStateRef.current.socketKey,
      name: partyStateRef.current.name || props.linkedPartyName
    }
    const onResponse = (res) => {
      partyDispatch({
        type: 'Party:joined',
        res
      })
    }
    socketRequest(emitting, onResponse)
  }

  function leave (event) {
    const emitting = {
      reqName: 'leaveParty',
      socketKey: partyStateRef.current.socketKey,
      name: partyStateRef.current.name
    }
    const onResponse = (res) => {
      partyDispatch({
        type: 'Party:left',
        res
      })
    }
    socketRequest(emitting, onResponse)
  }

  const ok = !isServer &&
    socket.connected &&
    !checkingName &&
    (
      !(
        props.linkedPartyName === '' ||
        props.linkedPartyName === null
      ) || !(
        partyState.name === '' ||
        partyState.name === null
      )
    )
  const partying = (partyState.hosting || partyState.attending) && ok
  const classes = props.className ? props.className.split(' ') : []
  if (props.collapsed) {
    classes.push('collapsed')
  } else {
    classes.push('not-collapsed')
  }
  classes.push(socket.connected ? 'connected' : 'disconnected')
  if (partyState.hosting) {
    classes.push('hosting')
  }
  if (partyState.attending) {
    classes.push('attending')
  }

  const canJoin = ok && partyState.exists
  const canStart = ok && !partyState.exists
  const joinBtnClasses = ['joinBtn']
  const startBtnClasses = ['startBtn']
  if (canJoin) {
    joinBtnClasses.push('enabled')
  }
  if (canStart) {
    startBtnClasses.push('enabled')
  }

  return useMemo(() => {
    return (
      <div
        className={classes.join(' ')}
      >
        <form onSubmit={onSubmit}>
          <input
            type='text'
            placeholder={props.placeholder}
            autoFocus={props.autoFocus && ok && !partying}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={partying}
            ref={field}
            defaultValue={partyState.name === null && props.linkedPartyName ? props.linkedPartyName : (partyState.name || '')}
          />
          <button
            className={joinBtnClasses.join(' ')}
            // disabled={!canJoin}
            onClick={onJoin}
            key='joinBtn'
          >
            {
              partyState.attending
                ? dict.get('party.leave')
                : (partyState.hosting ? dict.get('party.hosting') : dict.get('party.join'))
            }
            {partyState.attending
              ? (
                <span className='buttonIcon'>
                  <LeaveIcon />
                </span>
              )
              : null
            }
          </button>
          <button
            className={startBtnClasses.join(' ')}
            // disabled={!canStart}
            onClick={onStart}
            key='startBtn'
          >
            {
              partyState.hosting
                ? dict.get('party.stop')
                : (partyState.attending ? dict.get('party.attending') : dict.get('party.start'))
            }
            {partyState.hosting
              ? (
                <span className='buttonIcon'>
                  {stopIcon}
                </span>
              )
              : null
            }
          </button>
        </form>
        <style jsx>{`
          div {
            max-width: 640px;
            margin: 0 auto;
          }

          input {
            display: block;
            width: 100%;
            padding: 5px;
            font-size: xx-large;
            line-height: 2em;
            text-align: center;
            border-radius: 0;
            background-color: white;
          }

          .hosting input, .attending input {
            background-color: transparent;
            border-width: 0;
            &:disabled {
              color: ${colors.placeholder};
            }
          }

          button {
            padding: 5px;
            font-size: medium;
            line-height: 1.5em;
            color: ${colors.text};
            background-color: ${colors.textBg};
            &.enabled {
              color: ${colors.primaryText};
              background-color: ${colors.primaryBg};
              border-color: ${colors.primaryText};
            }
          }

          .hosting button.enabled, .attending button.enabled {
            background-color: ${colors.textBg};
          }

          .hosting .startBtn, .attending .joinBtn {
            background-color: ${colors.dangerousBg};
            color: ${colors.dangerousText};
            border-color: ${colors.dangerousText};
          }

          .hosting .joinBtn, .attending .startBtn {
            opacity: 0.4;
            background-color: ${colors.textBg};
            font-weight: bold;
          }

          .joinBtn, .startBtn {
            position: relative;
            width: 50%;
            cursor: pointer;
            opacity: 1;
            transition-property: opacity, background-color;
            transition-duration: ${durations.instant};
            transition-timing-function: ${tfns.easeInOutQuad};
          }
          .joinBtn .buttonIcon {
            position: absolute;
            left: 5px;
            top: 3px;
            width: 30px;
            height: 30px;
          }
          .startBtn .buttonIcon {
            position: absolute;
            right: 5px;
            top: 3px;
            width: 20px;
            height: 20px;
          }
        `}</style>
      </div>
    )
  }, [partyState, socket.connected, checkingName])
}

const props = [
  { name: 'autoFocus', type: PropTypes.bool, val: false },
  { name: 'className', type: PropTypes.string, val: '' },
  { name: 'placeholder', type: PropTypes.string, val: '' },
  { name: 'name', type: PropTypes.string, val: '' },
  { name: 'onFieldRef', type: PropTypes.func, val: () => {} },
  { name: 'linkedPartyName', type: PropTypes.string, val: '' }
]

Party.defaultProps = defaultProps(props)
Party.propTypes = propTypes(props)

export default Party
