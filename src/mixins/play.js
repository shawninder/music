const play = function play () {
  return {
    txt: 'play',
    className: 'playButton',
    go: (data, dispatch) => {
      return (event) => {
        event.stopPropagation()
        dispatch({
          type: 'Queue:play',
          data
        })
      }
    }
  }
}

export default play
