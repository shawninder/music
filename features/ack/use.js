import { useReducer } from 'react'

import ackReducer from './reducer'
import defaultAckState from './defaultState'

function useAck () {
  const [state, dispatch] = useReducer(ackReducer, defaultAckState)

  return [state, dispatch]
}

export default useAck
