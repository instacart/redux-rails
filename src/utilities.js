let uniqueClientId = 0

export function determinOptimisticUpdateSetting({resourceConfig, config, defaultConfig={}}) {
  if (isBool(resourceConfig.optimisticUpdateEnabled)) { return resourceConfig.optimisticUpdateEnabled }
  if (isBool(config.resources.optimisticUpdateEnabled)) { return config.resources.optimisticUpdateEnabled }
  if (isBool(config.optimisticUpdateEnabled)) { return config.optimisticUpdateEnabled }
  if (isBool(defaultConfig.optimisticUpdateEnabled)) { return defaultConfig.optimisticUpdateEnabled }

  return true
}

export function determineResourceType({controller}) {
  // resource type is determined by wether or not the controller name is plural
  // this may be overly simplistic
  // example: 'bus' is a memeber, but would return collection here
  if (controller[controller.length - 1] === 's') {
    return 'collection'
  }

  return 'member'
}

export function getResourceNameSpace({config, resource}) {
  // returns either 'models' or 'attributes' based on resource type
  const controller = config.resources[resource].controller
  const resourceType = determineResourceType({controller})

  return (resourceType === 'collection') ? 'models' : 'attributes'
}

export function getResourceIdAttribute({config, resource}) {
  return config.resources[resource].idAttribute || 'id'
}

export function getUniqueClientId() {
  return ++uniqueClientId
}

export function isBool(val) { return typeof val === 'boolean' }

export function getConfig({config}) {
  if (typeof config === 'function') {
    return config()
  }

  return config
}
