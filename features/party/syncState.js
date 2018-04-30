import deepEqual from 'deep-equal'
import cloneDeep from 'lodash.clonedeep'

export default function syncState (paths, config) {
  const filter = (state) => {
    let slice = {}
    paths.forEach((path) => {
      const item = cloneDeep(state[path])
      if (item) {
        slice[path] = item
      }
    })
    return slice
  }
  return (next) => {
    return (reducer, initialState, enhancer) => {
      let snapshot = filter(initialState)
      const store = next(reducer, initialState, enhancer)
      store.subscribe(function () {
        if (config.socket.connected) {
          const state = store.getState()
          if (state.party.hosting) {
            const slice = filter(state)
            if (!deepEqual(slice, snapshot)) {
              snapshot = slice
              const emitting = {
                type: 'Party:slice',
                slice,
                socketKey: state.party.socketKey,
                name: state.party.name,
                as: 'host'
              }
              config.socket.emit('slice', emitting)
              console.log('emitted slice', emitting)
            }
          }
        }
      })
      return store
    }
  }
}
