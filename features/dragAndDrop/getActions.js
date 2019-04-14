import cloneDeep from 'lodash.clonedeep'
import pullAt from 'lodash.pullat'

const actionCreators = {
  'droppable-history': {
    'droppable-history': ({ source, destination }) => {
      return [{
        type: 'Queue:move',
        from: {
          name: 'history',
          idx: source.index
        },
        to: {
          name: 'history',
          idx: destination.index
        }
      }]
    },
    'droppable-playingNow': ({ source, destination }) => {
      return [{
        type: 'Queue:moveNow',
        to: {
          name: 'history',
          idx: destination.index
        }
      }]
    },
    'droppable-upNext': ({ source, destination }) => {
      return [{
        type: 'Queue:move',
        from: {
          name: 'upNext',
          idx: source.index
        },
        to: {
          name: 'history',
          idx: destination.index
        }
      }]
    },
    'droppable-bar-list': ({ source, destination, origin, fromBar, state }) => {
      return [{
        type: 'Queue:insert',
        data: fromBar,
        at: {
          name: 'history',
          idx: destination.index
        },
        origin
      }]
    },
    'droppable-files': ({ source, destination, origin, state }) => {
      return [{
        type: 'Queue:insert',
        data: state.fileInput.files[source.index],
        at: {
          name: 'history',
          idx: destination.index
        },
        origin
      }]
    }
  },
  'droppable-playingNow': {
    'droppable-history': ({ source, destination, origin, state }) => {
      const hist = cloneDeep(state.queue.history)
      const item = cloneDeep(hist[source.index])
      pullAt(hist, source.index)
      const actions = [{
        type: 'Queue:dequeue',
        newHistory: hist,
        origin
      }]
      if (state.queue.now.key) {
        actions.push({
          type: 'Queue:toHistory',
          data: state.queue.now,
          origin
        })
      }
      return actions.concat([{
        type: 'Queue:play',
        data: item,
        origin
      }, {
        type: 'Player:setPlaying',
        playing: true
      }])
    },
    'droppable-upNext': ({ source, destination, origin, state }) => {
      const un = cloneDeep(state.queue.upNext)
      const item = cloneDeep(un[source.index])
      pullAt(un, source.index)
      const actions = [{
        type: 'Queue:dequeue',
        newUpNext: un,
        origin
      }]
      if (state.queue.now.key) {
        actions.push({
          type: 'Queue:toHistory',
          data: state.queue.now,
          origin
        })
      }
      return actions.concat([{
        type: 'Queue:play',
        data: item,
        origin
      }, {
        type: 'Player:setPlaying',
        playing: true
      }])
    },
    'droppable-bar-list': ({ source, destination, origin, fromBar, state }) => {
      const actions = []
      if (state.queue.now.key) {
        actions.push({
          type: 'Queue:toHistory',
          data: state.queue.now,
          origin
        })
      }
      return actions.concat([{
        type: 'Queue:play',
        data: fromBar,
        origin
      }, {
        type: 'Player:setPlaying',
        playing: true
      }])
    },
    'droppable-files': ({ source, destination, origin, state }) => {
      const actions = []
      if (state.queue.now.key) {
        actions.push({
          type: 'Queue:toHistory',
          data: state.queue.now,
          origin
        })
      }
      return actions.concat([{
        type: 'Queue:play',
        data: state.fileInput.files[source.index],
        origin
      }, {
        type: 'Player:setPlaying',
        playing: true
      }])
    }
  },
  'droppable-upNext': {
    'droppable-history': ({ source, destination }) => {
      return [{
        type: 'Queue:move',
        from: {
          name: 'history',
          idx: source.index
        },
        to: {
          name: 'upNext',
          idx: destination.index
        }
      }]
    },
    'droppable-playingNow': ({ source, destination }) => {
      return [{
        type: 'Queue:moveNow',
        to: {
          name: 'upNext',
          idx: destination.index
        }
      }]
    },
    'droppable-upNext': ({ source, destination }) => {
      return [{
        type: 'Queue:move',
        from: {
          name: 'upNext',
          idx: source.index
        },
        to: {
          name: 'upNext',
          idx: destination.index
        }
      }]
    },
    'droppable-bar-list': ({ source, destination, origin, fromBar, state }) => {
      return [{
        type: 'Queue:insert',
        data: fromBar,
        at: {
          name: 'upNext',
          idx: destination.index
        },
        origin
      }]
    },
    'droppable-files': ({ source, destination, origin, state }) => {
      return [{
        type: 'Queue:insert',
        data: state.fileInput.files[source.index],
        at: {
          name: 'upNext',
          idx: destination.index
        },
        origin
      }]
    }
  },
  'cancelDropZone': {
    'droppable-history': cancelDrag,
    'droppable-playingNow': cancelDrag,
    'droppable-upNext': cancelDrag,
    'droppable-bar-list': cancelDrag,
    'droppable-files': cancelDrag
  }
}

function cancelDrag ({ source, destination }) {
  return []
}

export default function getDragAndDropActions ({ source, destination, origin, fromBar, state }) {
  const src = source.droppableId
  const dst = destination.droppableId
  const dropZone = actionCreators[dst]
  if (dropZone) {
    const actionCreator = dropZone[src]
    if (actionCreator) {
      return actionCreator({ source, destination, origin, fromBar, state })
    }
    console.log(`Unhandled drag source ${src} dropped on ${dst}`)
  }
  console.log(`Unhandled drop zone ${dst}`)
  return []
}
