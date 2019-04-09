import { useRef, useState, useReducer, useEffect, useCallback } from 'react'
import io from 'socket.io-client'
import { diff as deepDiff } from 'deep-object-diff'

import partyReducer from './reducer'
import defaultPartyState from './defaultState'

import sessionStore from '../sessionStore'

const isServer = typeof window === 'undefined'

function useParty ({ intercept = [] }) {
  const { startState, updateState } = sessionStore('partyState')

  const [state, dispatch] = useReducer(partyReducer, defaultPartyState, startState)

  const [socket] = useState(() => {
    if (!isServer) {
      return io(state.socketUrl)
    }
    return {}
  })

  useEffect(() => {
    if (!isServer && !state.socketKey) {
      const value = Math.random().toString().slice(2)
      console.log('Generated socketKey', value)
      dispatch({
        type: 'Party:setSocketKey',
        value
      })
    }
  }, [])

  useEffect(() => {
    updateState(state)
  }, [state])

  function inspectServer () {
    if (socket.connected) {
      socket.once('gotDetails', (details) => {
        console.log('details', details)
      })
      console.log('emitting getDetails')
      socket.emit('getDetails')
    } else {
      console.log("Can't inspect party server, socket disconnected")
    }
  }

  function useSync (newState, key) {
    const oldState = useRef({})
    useEffect(() => {
      if (state.hosting && socket.connected) {
        // TODO send patch instead of version
        const slice = deepDiff(oldState.current, newState)
        const emitting = {
          type: 'Party:slice',
          slice: {},
          socketKey: state.socketKey,
          name: state.name,
          as: 'host'
        }
        emitting.slice[key] = slice
        console.log('emitting slice', emitting)
        socket.emit('slice', emitting)
      }
    }, [state.hosting, newState, state.socketKey, state.name])
  }

  useSync(state, 'party')

  const forward = useCallback((action, dispatcher) => {
    if (state.attending) {
      const emitting = {
        ...action,
        socketKey: state.socketKey,
        name: state.name,
        as: 'guest'
      }
      socket.emit('dispatch', emitting)
    } else {
      dispatcher(action)
    }
  }, [state, socket])

  function interceptor (dispatcher) {
    return (action) => {
      forward(action, dispatcher)
    }
  }

  return [state, dispatch, { socket, useSync, inspectServer, intercepted: intercept.map(interceptor) }]
}

export default useParty
