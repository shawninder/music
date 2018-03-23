const remember = function remember (collection) {
  return {
    txt: '✔',
    className: (data) => {
      return collection[data.id.videoId]
        ? 'inCollection'
        : 'notInCollection'
    },
    go: (data, dispatch) => {
      return (event) => {
        event.stopPropagation()
        dispatch({
          type: 'Collection:toggle',
          data
        })
      }
    }
  }
}

export default remember
