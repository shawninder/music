import { useReducer, useEffect } from 'react'

import appReducer from './reducer'
import defaultAppState from './defaultState'

import sessionStore from '../sessionStore'

function useApp () {
  const { startState, updateState } = sessionStore('appState')

  const [state, dispatch] = useReducer(appReducer, defaultAppState, startState)

  useEffect(() => {
    updateState(state)
  }, [state])

  return [state, dispatch]
}

export default useApp
