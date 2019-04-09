import { createContext } from 'react'

import defaultState from './defaultState'

const BarContext = createContext({ state: defaultState })

export default BarContext
