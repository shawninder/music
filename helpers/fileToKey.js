export default (file) => {
  return encodeURIComponent(`${file.size}_${file.lastModified}_${file.name}`)
}
