import youtubeUrl from './youtubeUrl'
import indexedDBUrl from './indexedDBUrl'
import fileUrl from './fileUrl'

export default function toUrl (item) {
  switch (item.type) {
    case 'YouTube':
      return youtubeUrl(item)
    case 'AudioFile':
      if (item.origin) {
        return indexedDBUrl(item)
      } else {
        return fileUrl(item)
      }
    default:
      throw new Error(`Unknown Player url item.type ${item.type}`)
  }
}
