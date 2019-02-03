import hexToRgb from './hexToRgb'

export default (color, opacity) => {
  const rgb = hexToRgb(color)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}
