const dismiss = function dismiss () {
  return {
    txt: 'x',
    className: 'dismissButton',
    go: (data, dispatch) => {
      return (event) => {
        event.stopPropagation()
        dispatch({
          type: 'Bar:dismiss',
          data
        })
      }
    }
  }
}

export default dismiss
