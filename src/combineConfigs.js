import { determinOptimisticUpdateSetting, getConfig, isBool } from './utilities'

export default (...configs) => {
  const defaultConfig = getConfig({config: configs[0]}) || {} // the first config is used as the default settings
  let finalConfig = Object.assign({}, defaultConfig, {
    resources: Object.assign({}, defaultConfig.resources)
  })

  configs
    .map((inConfig) => {
      const config = getConfig({config: inConfig})
      if (!config.resources) { return }
      const newResources = {}
      Object.keys(config.resources || {}).forEach((resourceName) => {
        const resource = config.resources[resourceName]

        // mid-level  settings
        if (resourceName === 'baseUrl' && typeof resource === 'string') { return }
        if (resourceName === 'optimisticUpdateEnabled' && isBool(resource)) { return }

        // apply some settings to all resources in config without being specified
        // this is particularly useful for multi-config setups
        newResources[resourceName] = Object.assign({}, resource, {
          baseUrl: resource.baseUrl || config.resources.baseUrl || defaultConfig.baseUrl,
          optimisticUpdateEnabled: determinOptimisticUpdateSetting({resourceConfig: resource, config, defaultConfig})
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
