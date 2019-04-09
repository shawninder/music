import { useEffect, useState, useRef, useCallback } from 'react'

const isServer = typeof window === 'undefined'

function usePulse (fn, initialDelay = 5000) {
  const [delay, setDelay] = useState(initialDelay)
  const [timestamp, setTimestamp] = useState(null)
  const timeoutId = useRef(null)

  const pulse = useCallback(() => {
    fn()
    start(delay)
  }, [delay])

  function start (requiredDelay) {
    setTimestamp(Date.now())
    timeoutId.current = global.setTimeout(pulse, requiredDelay)
  }

  function stop () {
    if (timeoutId.current) {
      global.clearTimeout(timeoutId.current)
    }
    if (timestamp) {
      setTimestamp(null)
    }
  }

  const changeDelay = useCallback((newDelay) => {
    if (timeoutId.current && timestamp) {
      global.clearTimeout(timeoutId.current)
      const now = Date.now()
      const diff = now - timestamp

      if (diff > newDelay) {
        fn()
        start(newDelay)
      } else {
        start(newDelay - diff)
      }
    } else {
      start(newDelay)
    }
    setDelay(newDelay)
  }, [timestamp])

  useEffect(() => {
    if (!isServer) {
      start(initialDelay)
      return () => {
        stop()
      }
    }
  }, [])
  return [changeDelay]
}

export default usePulse
