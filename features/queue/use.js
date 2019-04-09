import { useReducer, useEffect } from 'react'

import queueReducer from './reducer'
import defaultQueueState from './defaultState'

import sessionStore from '../sessionStore'

function useQueue () {
  const { startState, updateState } = sessionStore('queueState')

  const [state, dispatch] = useReducer(queueReducer, defaultQueueState, startState)

  useEffect(() => {
    updateState(state)
  }, [state])

  return [state, dispatch]
}

export default useQueue
