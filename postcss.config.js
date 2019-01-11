const get = require('lodash.get')

module.exports = (ctx) => {
  const originalOptions = get(ctx, 'options.autoprefixer')
  const plugins = {
    autoprefixer: {
      ...originalOptions,
      grid: true
    }
  }
  plugins['postcss-nested'] = {}
  return { plugins }
}
