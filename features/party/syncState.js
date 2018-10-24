import deepEqual from 'deep-equal'
import cloneDeep from 'lodash.clonedeep'

export default function syncState (paths, config) {
  return (next) => {
    return (reducer, initialState, enhancer) => {
      const snapshots = paths.reduce((snaps, path) => {
        const item = cloneDeep(initialState[path])
        if (item) {
          snaps[path] = item
        }
        return snaps
      }, {})
      const store = next(reducer, initialState, enhancer)
      store.subscribe(function () {
        if (config.socket.connected) {
          const state = store.getState()
          if (state.party.hosting) {
            const changes = paths.reduce((changed, path) => {
              const slice = state[path]
              if (!deepEqual(slice, snapshots[path])) {
                snapshots[path] = slice
                changed[path] = slice
              }
              return changed
            }, {})
            if (Object.keys(changes).length > 0) {
              const emitting = {
                type: 'Party:slice',
                slice: changes,
                socketKey: state.socketKey,
                name: state.party.name,
                as: 'host'
              }
              config.socket.emit('slice', emitting)
            }
          }
        }
      })
      return store
    }
  }
}
