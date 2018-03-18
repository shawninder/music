const enqueue = function enqueue () {
  return {
    txt: '⤵',
    className: 'enqueueButton',
    go: (data, dispatch) => {
      return (event) => {
        event.stopPropagation()
        dispatch({
          type: 'Queue:enqueue',
          data
        })
      }
    }
  }
}

export default enqueue
