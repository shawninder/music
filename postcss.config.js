module.exports = (ctx) => {
  const plugins = {
    autoprefixer: {
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9'
      ]
    }
  }
  return { plugins }
}
