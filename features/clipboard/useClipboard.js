import { useState, useEffect } from 'react'
import Clipboard from 'clipboard'

export default function useClipboard (buttonEl, linkEl, { success, error } = {}) {
  const [clipboard, setClipboard] = useState(null)
  useEffect(() => {
    if (buttonEl && linkEl) {
      setClipboard(new Clipboard(buttonEl, {
        target: () => {
          return linkEl
        }
      }))
      return () => {
        setClipboard(null)
      }
    }
  }, [buttonEl, linkEl])
  useEffect(() => {
    if (clipboard && success) {
      clipboard.on('success', success)
      if (error) {
        clipboard.on('error', error)
      }
    }
    return () => {
      if (clipboard) {
        clipboard.destroy()
      }
    }
  }, [clipboard])
  return clipboard
}
