import { createContext } from 'react'

import defaultState from './defaultState'

const AckContext = createContext({ state: defaultState })

export default AckContext
