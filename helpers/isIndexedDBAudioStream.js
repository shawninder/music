const idbProtocol = 'indexeddb://'

const isServer = typeof window === 'undefined'

export default function isIndexedDBAudioStream (url) {
  return (
    typeof !isServer &&
    (
      typeof global.indexedDB !== 'undefined' ||
      typeof global.mozIndexedDB !== 'undefined' ||
      typeof global.webkitIndexedDB !== 'undefined' ||
      typeof global.msIndexedDB !== 'undefined'
    ) &&
    url.startsWith(idbProtocol)
  )
}
