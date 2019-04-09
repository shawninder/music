import { createContext } from 'react'

import defaultState from './defaultState'

const AppContext = createContext({ state: defaultState })

export default AppContext
