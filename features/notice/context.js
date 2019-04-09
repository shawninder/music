import { createContext } from 'react'

import defaultState from './defaultState'

const NoticeContext = createContext({ state: defaultState })

export default NoticeContext
