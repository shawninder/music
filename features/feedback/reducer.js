import cloneDeep from 'lodash.clonedeep'

export default function feedbackReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {
    case 'Feedback:submitting':
      newState.submitting = true
      break
    default:
      // Do nothing
  }
  return newState
}
