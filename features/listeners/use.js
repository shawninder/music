import { useEffect } from 'react'
import passiveSupported from '../../helpers/passiveSupported'

const isServer = typeof window === 'undefined'

function useListeners (listeners, {
  eventTarget = false,
  all = () => {},
  listenerOptions = passiveSupported ? { passive: true, capture: false } : false
} = {}) {
  useEffect(() => {
    if (!isServer && eventTarget) {
      eventTarget.addEventListener('keydown', keyDown, listenerOptions)
      return () => {
        eventTarget.removeEventListener('keydown', keyDown, listenerOptions)
      }
    }
  }, [])
  useEffect(() => {
    if (!isServer && eventTarget && listeners.click) {
      eventTarget.addEventListener('click', click, listenerOptions)
      return () => {
        eventTarget.removeEventListener('click', click, listenerOptions)
      }
    }
  }, [])
  function click (event) {
    if (listeners.click) {
      listeners.click(event)
    }
  }
  function keyDown (event) {
    all(event)
    const plain = !event.metaKey && !event.ctrlKey && !event.shiftKey
    const ctrl = !event.metaKey && event.ctrlKey && !event.shiftKey
    const shift = !event.metaKey && !event.ctrlKey && event.shiftKey
    const ctrlShift = !event.metaKey && event.ctrlKey && event.shiftKey
    if (listeners['enter'] && event.keyCode === 13 && plain) {
      listeners['enter'](event)
    }
    if (listeners['ctrl+enter'] && event.keyCode === 13 && ctrl) {
      listeners['ctrl+enter'](event)
    }
    if (listeners['shift+enter'] && event.keyCode === 13 && shift) {
      listeners['shift+enter'](event)
    }
    if (listeners['ctrl+shift+enter'] && event.keyCode === 13 && ctrlShift) {
      listeners['ctrl+shift+enter'](event)
    }
    if (listeners['up'] && event.keyCode === 38 && plain) {
      listeners['up'](event)
    }
    if (listeners['down'] && event.keyCode === 40 && plain) {
      listeners['down'](event)
    }
    if (listeners['esc'] && event.keyCode === 27 && plain) {
      listeners['esc'](event)
    }
    if (listeners['space'] && event.keyCode === 32 && plain) {
      listeners['space'](event)
    }
    if (listeners['ctrl+space'] && ctrl && event.keyCode === 32) {
      listeners['ctrl+space'](event)
    }
  }
  return { click, keyDown }
}

export default useListeners
