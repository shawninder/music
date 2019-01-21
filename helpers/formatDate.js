import padNb from './padNb'

const format = (date) => {
  const year = date.getFullYear()
  const month = padNb(date.getMonth() + 1)
  const day = padNb(date.getDate())
  const hours = padNb(date.getHours())
  const minutes = padNb(date.getMinutes())
  const seconds = padNb(date.getSeconds())
  const offset = date.getTimezoneOffset()

  const offHours = Math.round(offset / 60)
  const offMinutes = (offset % 60).toString().padStart(2, '0')

  const dateString = `${year}-${month}-${day}`
  const timeString = `${hours}:${minutes}:${seconds}`
  const zoneString = `GMT+${offHours}:${offMinutes}`

  return `${dateString} ${timeString} ${zoneString}`
}

export default format
