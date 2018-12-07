import get from 'lodash.get'
import cloneDeep from 'lodash.clonedeep'

const decorate = (action) => {
  const meta = action.meta || {}
  return {
    type: 'AudioFile',
    key: action.key,
    meta: meta,
    idx: action.idx,
    filePath: action.filePath,
    fakePath: get(action, 'target.value', ''),
    hydrated: action.hydrated
  }
}
// const dedupe = (files) => {
//   const paths = {}
//   return files.reduce((newFiles, file) => {
//     if (!paths[file.key]) {
//       newFiles.push(file)
//     }
//     paths[file.key] = true
//     return newFiles
//   }, [])
// }
export default function fileInputReducer (state = {}, action) {
  const newState = cloneDeep(state)
  switch (action.type) {
    case 'FileInput:new':
      newState.files.push(decorate({ key: '' }))
      break
    case 'FileInput:newFile': {
      const obj = { ...action, hydrated: false }
      const len = newState.files.length
      const lastIdx = len === 0 ? 0 : len - 1
      const lastItem = newState.files[lastIdx]
      if (!lastItem) {
        newState.files.push(decorate(obj))
      } else {
        if (lastItem.key) {
          newState.files.push(decorate(obj))
        } else {
          newState.files[lastIdx] = decorate(obj)
        }
      }
      break
    }
    case 'FileInput:cancelNew':
      newState.files.pop()
      break
    case 'FileInput:meta':
      for (let i = 0, len = newState.files.length; i < len; i += 1) {
        const file = newState.files[i]
        if (file.key === action.key) {
          const obj = { ...file, ...action, idx: i, hydrated: true }
          newState.files[i] = decorate(obj)
        }
      }
      break
    case 'FileInput:setItems':
      newState.files = action.files
      break
  }
  return newState
}
