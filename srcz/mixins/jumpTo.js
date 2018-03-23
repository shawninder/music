const jumpTo = function (idx) {
  return {
    txt: 'Jump to track',
    className: 'jumpToButton',
    go: (data, dispatch) => {
      return (event) => {
        event.stopPropagation()
        dispatch({
          type: 'Queue:jumpTo',
          data,
          idx
        })
      }
    }
  }
}

export default jumpTo
