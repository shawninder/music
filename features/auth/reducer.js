import cloneDeep from 'lodash.clonedeep'

export default function authReducer (state = {}, action) {
  console.log('REDUCER', action)
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Auth:setUsername':
      newState.username = action.value
      break
    case 'Auth:setPassword':
      newState.password = action.value
      break
  }
  return newState
}
