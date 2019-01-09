import get from 'lodash.get'
import imgDataToUrl from './imgDataToUrl'

export default function getFileArt (data) {
  const format = get(data, 'meta.tags.picture.format')
  const imgData = get(data, 'meta.tags.picture.data')
  if (format && imgData) {
    return imgDataToUrl(imgData, format)
  }
}
