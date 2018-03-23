export default function propTypes (props) {
  return props.reduce((obj, item) => {
    obj[item.name] = item.type
    return obj
  }, {})
}
