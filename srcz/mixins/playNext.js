const playNext = function playNext () {
  return {
    txt: '>',
    className: 'toUpNextButton',
    go: (data, dispatch) => {
      return (event) => {
        event.stopPropagation()
        dispatch({
          type: 'Queue:playNext',
          data
        })
      }
    }
  }
}

export default playNext
