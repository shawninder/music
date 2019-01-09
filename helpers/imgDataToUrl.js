import btoa from 'btoa'

export default function imgDataToUrl (data, format) {
  let base64String = ''
  for (let i = 0, len = data.length; i < len; i += 1) {
    base64String += String.fromCharCode(data[i])
  }
  const result = `data:${format};base64,${btoa(base64String)}`
  return result
}
