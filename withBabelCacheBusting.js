module.exports = exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack (config, options) {
      config.module.rules = config.module.rules.map((rule) => {
        if (rule.use && rule.use.loader === 'babel-loader') {
          rule.use.options.cacheDirectory = false
        }
        return rule
      })
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }
      return config
    }
  })
}
