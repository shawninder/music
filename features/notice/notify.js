export default (dispatch) => {
  return (msg) => {
    dispatch({
      type: 'Notice:push',
      msg
    })
    if (msg.id && msg.duration) {
      global.setTimeout(() => {
        dispatch({
          type: 'Notice:remove',
          id: msg.id
        })
      }, msg.duration)
    }
  }
}
