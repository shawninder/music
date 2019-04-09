const isServer = typeof window === 'undefined'

export default function sessionStore (storageKey) {
  function startState (defaultState) {
    if (isServer) {
      return defaultState
    }
    try {
      const retVal = global.sessionStorage.getItem(storageKey)
      return retVal ? JSON.parse(retVal) : defaultState
    } catch (ex) {
      console.error(ex)
      return defaultState
    }
  }
  function updateState (state) {
    if (!isServer) {
      global.sessionStorage.setItem(storageKey, JSON.stringify(state))
    }
  }
  return { startState, updateState }
}
