import { createContext } from 'react'

import defaultState from './defaultState'

const QueueContext = createContext({ state: defaultState })

export default QueueContext
