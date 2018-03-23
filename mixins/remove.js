const remove = function remove (idx) {
  return {
    txt: 'X',
    className: 'removeButton',
    go: (data, dispatch) => {
      return (event) => {
        event.stopPropagation()
        dispatch({
          type: 'Queue:dequeue',
          idx
        })
      }
    }
  }
}
export default remove
