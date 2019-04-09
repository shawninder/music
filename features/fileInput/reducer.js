import get from 'lodash.get'

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
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'FileInput:new': {
      const newState = cloneMerge()
      newState.files.push(decorate({ key: '' }))
      return newState
    }
    case 'FileInput:newFile': {
      const obj = { ...action, hydrated: false }
      const newState = cloneMerge()
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
      return newState
    }
    case 'FileInput:cancelNew': {
      const newState = cloneMerge()
      newState.files.pop()
      return newState
    }
    case 'FileInput:meta': {
      const newState = cloneMerge()
      for (let i = 0, len = newState.files.length; i < len; i += 1) {
        const file = newState.files[i]
        if (file.key === action.key) {
          const obj = { ...file, ...action, idx: i, hydrated: true }
          newState.files[i] = decorate(obj)
        }
      }
      return newState
    }
    case 'FileInput:setItems': {
      const newState = cloneMerge()
      newState.files = action.files
      return newState
    }
    default:
      return state
  }
}
