export default (...configs) => {
  const defaultConfig = configs[0] || {} // the first config is used as the default settings
  let finalConfig = Object.assign({}, defaultConfig, {
    resources: Object.assign({}, defaultConfig.resources)
  })

  configs
    .map((config) => {
      if (!config.resources) { return }
      const newResources = {}
      Object.keys(config.resources || {}).forEach((resourceName) => {
        const resource = config.resources[resourceName]

        // mid-level domain setting
        if (resourceName === 'domain' && typeof resource === 'string') { return }

        // apply domain to all resources in config without a domain specified
        // this is particularly useful for multi-config setups
        newResources[resourceName] = Object.assign({}, resource, {
          domain: resource.domain || config.resources.domain || defaultConfig.domain
        })
      })

      return newResources
    })
    .filter(resource => typeof resource !== 'undefined')
    .forEach((resourceMap) => {
      Object.keys(resourceMap).forEach((resourceName) => {
        let resource = resourceMap[resourceName]

        finalConfig.resources[resourceName] = Object.assign({}, resource)
      })
    })

  return finalConfig
}