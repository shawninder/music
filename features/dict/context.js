import { createContext } from 'react'

const DictContext = createContext({ dict: { get: key => 'Please use Dict.Provider', using: 'en' } })

export default DictContext
