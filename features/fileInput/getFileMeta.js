module.exports = exports = function getFileMeta (file) {
  return new Promise((resolve, reject) => {
    global.jsmediatags.read(file, {
      onSuccess: resolve,
      onError: reject
    })
  })
}
