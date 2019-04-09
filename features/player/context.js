import { createContext } from 'react'

import defaultState from './defaultState'

const PlayerContext = createContext({ state: defaultState })

export default PlayerContext
