export default function defaultProps (props) {
  return props.reduce((obj, item) => {
    obj[item.name] = item.val
    return obj
  }, {})
}
