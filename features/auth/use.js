import { useReducer } from 'react'

import reducer from './reducer'
import defaultState from './defaultState'

function useAuth () {
  const [state, dispatch] = useReducer(reducer, defaultState)

  return [state, dispatch]
}

export default useAuth
