import cloneDeep from 'lodash.clonedeep'

export default function dictReducer (state = {}, action) {
  let newState = cloneDeep(state)
  switch (action.type) {

  }
  return newState
}
