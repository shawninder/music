import { useEffect } from 'react'

import passiveSupported from '../../helpers/passiveSupported'

const listenerOptions = passiveSupported ? { passive: true, capture: false } : false
const isServer = typeof window === 'undefined'

export default function useOnViewport (cb) {
  useEffect(() => {
    if (!isServer) {
      // see https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
      if (global.addEventListener) {
        global.addEventListener('load', cb, listenerOptions)
        global.addEventListener('DOMContentLoaded', cb, listenerOptions)
        global.addEventListener('load', cb, listenerOptions)
        global.addEventListener('scroll', cb, listenerOptions)
        global.addEventListener('resize', cb, listenerOptions)
      } else if (global.attachEvent) {
        global.attachEvent('onload', cb)
        global.attachEvent('onDOMContentLoaded', cb)
        global.attachEvent('onload', cb)
        global.attachEvent('onscroll', cb)
        global.attachEvent('onresize', cb)
      }
    }
    return () => {
      if (!isServer) {
        // see https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
        if (global.removeEventListener) {
          global.removeEventListener('load', cb, listenerOptions)
          global.removeEventListener('DOMContentLoaded', cb, listenerOptions)
          global.removeEventListener('load', cb, listenerOptions)
          global.removeEventListener('scroll', cb, listenerOptions)
          global.removeEventListener('resize', cb, listenerOptions)
        } else if (global.detachEvent) {
          global.detachEvent('onload', cb)
          global.detachEvent('onDOMContentLoaded', cb)
          global.detachEvent('onload', cb)
          global.detachEvent('onscroll', cb)
          global.detachEvent('onresize', cb)
        }
      }
    }
  })
}
