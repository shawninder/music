import { useReducer } from 'react'

import noticeReducer from './reducer'
import defaultNoticeState from './defaultState'

function useNotice () {
  const [state, dispatch] = useReducer(noticeReducer, defaultNoticeState)

  function notify (msg) {
    dispatch({
      type: 'Notice:push',
      msg
    })
    if (msg.id && msg.duration) {
      global.setTimeout(() => {
        dispatch({
          type: 'Notice:remove',
          id: msg.id
        })
      }, msg.duration)
    }
  }

  return [state, dispatch, notify]
}

export default useNotice
