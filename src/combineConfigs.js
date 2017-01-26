export default (...configs) => {
  let finalConfig = Object.assign({}, configs[0] || {}) // the first config is used as the default settings
  let config
  let resource

  configs.forEach((config) => {
    // apply domain to all resources in config without a domain specified
    // this is particularly useful for multi-config setups
    Object.keys(config.resources|| {}).forEach((resourceName) => {
      resource = config.resources[resourceName]
      resource.domain = resource.domain || config.domain || finalConfig.domain
    })

    finalConfig.resources = Object.assign({}, finalConfig.resources, config.resources)
  })

  return finalConfig
}
