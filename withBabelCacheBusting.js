module.exports = exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack (config, options) {
      if (nextConfig.webpack) {
        config = nextConfig.webpack(config, options)
      }
      config.module.rules = config.module.rules.map((rule) => {
        if (rule.use && rule.use.loader === 'babel-loader') {
          rule.use.options.cacheDirectory = false
        }
        return rule
      })
      return config
    }
  })
}
