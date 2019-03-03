export default (objectId) => {
  return parseInt(objectId.toString().substring(0, 8), 16) * 1000
}
