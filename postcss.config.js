module.exports = (ctx) => {
  const plugins = {
    autoprefixer: {
      ...ctx.options.autoprefixer,
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9'
      ]
    }
  }
  plugins['postcss-nested'] = {}
  return { plugins }
}
