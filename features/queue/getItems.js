import cloneDeep from 'lodash.clonedeep'

export default function getItems (action) {
  let items = cloneDeep(action.data)
  if (!Array.isArray(items)) {
    return [items]
  }
  return items
}
