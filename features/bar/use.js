import { useReducer } from 'react'

import barReducer from './reducer'
import defaultBarState from './defaultState'

function useApp () {
  const [state, dispatch] = useReducer(barReducer, defaultBarState)

  return [state, dispatch]
}

export default useApp
