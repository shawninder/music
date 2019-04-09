import { createContext } from 'react'

import defaultState from './defaultState'

const FileInputContext = createContext({ state: defaultState })

export default FileInputContext
