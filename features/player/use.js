import { useReducer, useEffect } from 'react'

import playerReducer from './reducer'
import defaultState from './defaultState'

import sessionStore from '../sessionStore'

function usePlayer () {
  const { startState, updateState } = sessionStore('playerState')
  const [state, dispatch] = useReducer(playerReducer, defaultState, startState)

  useEffect(() => {
    updateState(state)
  }, [state])

  return [state, dispatch]
}

export default usePlayer
