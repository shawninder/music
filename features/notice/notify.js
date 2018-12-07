export default (msg) => {
  return (dispatch, getState) => {
    dispatch({
      type: 'Notice:push',
      msg
    })
    if (msg.id && msg.duration) {
      setTimeout(() => {
        dispatch({
          type: 'Notice:remove',
          id: msg.id
        })
      }, msg.duration)
    }
  }
}
