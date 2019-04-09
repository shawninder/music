import defaultState from './defaultState'

export default function authReducer (state = defaultState, action) {
  function cloneMerge (partial) {
    return Object.assign({}, state, partial)
  }
  switch (action.type) {
    case 'Auth:setUsername':
      return cloneMerge({ username: action.value })
    case 'Auth:setPassword':
      return cloneMerge({ password: action.value })
    default:
      return state
  }
}
