import { useReducer } from 'react'

import fileInputReducer from './reducer'
import defaultFileInputState from './defaultState'

function useFileInput () {
  const [state, dispatch] = useReducer(fileInputReducer, defaultFileInputState)

  return [state, dispatch]
}

export default useFileInput
