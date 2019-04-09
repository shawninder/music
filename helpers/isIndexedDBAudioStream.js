const idbProtocol = 'indexeddb://'
export default function isIndexedDBAudioStream (url) {
  return (
    typeof window !== 'undefined' &&
    (
      typeof window.indexedDB !== 'undefined' ||
      typeof window.mozIndexedDB !== 'undefined' ||
      typeof window.webkitIndexedDB !== 'undefined' ||
      typeof window.msIndexedDB !== 'undefined'
    ) &&
    url.startsWith(idbProtocol)
  )
}
