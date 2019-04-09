import { useEffect } from 'react'

const isServer = typeof window === 'undefined'

export default function useOnViewport (cb) {
  useEffect(() => {
    if (!isServer) {
      // see https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
      if (global.addEventListener) {
        global.addEventListener('load', cb, false)
        global.addEventListener('DOMContentLoaded', cb, false)
        global.addEventListener('load', cb, false)
        global.addEventListener('scroll', cb, false)
        global.addEventListener('resize', cb, false)
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
          global.removeEventListener('load', cb, false)
          global.removeEventListener('DOMContentLoaded', cb, false)
          global.removeEventListener('load', cb, false)
          global.removeEventListener('scroll', cb, false)
          global.removeEventListener('resize', cb, false)
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
