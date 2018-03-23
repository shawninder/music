module.exports = exports = {
  defaultProps: (props) => {
    return props.reduce((obj, item) => {
      obj[item.name] = item.val
      return obj
    }, {})
  },
  propTypes: (props) => {
    return props.reduce((obj, item) => {
      obj[item.name] = item.type
      return obj
    }, {})
  }
}
