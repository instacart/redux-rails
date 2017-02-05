import {
  determineResourceType,
  getResourceIdAttribute,
  getUniqueClientId
 } from './utilities'

 const actionMethodMap = {
   SHOW    : 'GET',
   INDEX   : 'GET',
   CREATE  : 'POST',
   UPDATE  : 'PUT',
   DESTROY : 'DELETE',
 }

const parseResult = ({json, resource, config, resourceType}) => {
  const resourceParse = config.resources[resource].parse

  // parse methods can be defined per resousrce type or
  // as a catchall for all resource types
  switch(typeof resourceParse) {
    case 'object': {
      const parseMethod = resourceParse && resourceParse[resourceType]
      if (!parseMethod) { return json }

      return parseMethod(json)
    }
    case 'function': {
      return resourceParse(json)
    }
    default: {
      return json
    }
  }
}

const constructUrl = ({domain, controller, railsAction, data}) => {
  const resourceType = determineResourceType({controller})
  const urlTail = () => {
    // all actions on a collection, other than index and create, require an id
    if (resourceType === 'collection' && railsAction !== 'INDEX' && railsAction !== 'CREATE'){
      return `/${data.id}`
    }

    return ''
  }

  return `${domain}${controller}${urlTail()}`
}

const constructfetchOptions = ({railsAction, resource, config, data, fetchParams}) => {
  // options available match request the fetch Request object:
  // https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
  const method = actionMethodMap[railsAction]
  const headers = new Headers(fetchParams.headers || {})
  let options = Object.assign({}, fetchParams, { method, headers })

  // assume the body is meant to be JSON. Fetch requires you to Stringify JSON
  if (typeof data === 'object' && method !== 'GET') {
    options.body = JSON.stringify(data)
  }

  return options
}

const fetchResource = ({store, resource, config, data={}, railsAction, controllerOverride, fetchParamsOverride}) => {
  const resourceConfig = config.resources[resource]
  const domain = resourceConfig.domain || config.domain
  const controller = controllerOverride || resourceConfig.controller
  const idAttribute = getResourceIdAttribute({config, resource})
  const fetchParams = fetchParamsOverride || resourceConfig.fetchParams || config.fetchParams
  let cId

  if (railsAction === 'CREATE') {
    cId = getUniqueClientId()
    store.dispatch({ type: `${resource}.ASSIGN_CID`, cId })
    store.dispatch({ type: `${resource}.SET_LOADING`, cId})
  }

  fetch(
    constructUrl({domain, controller, railsAction, data}),
    constructfetchOptions({railsAction, resource, data, config, fetchParams})
  )
    .then((response) => {
      response.json()
        .then((json) => {
          const id = (json && json[idAttribute]) || data.id

          if(!response.ok) {
            return store.dispatch({
              type: `${resource}.${railsAction}_ERROR`,
              error: json.error || { message: response.statusText },
              id,
              cId
            })
          }

          store.dispatch({
            type: `${resource}.${railsAction}_SUCCESS`,
            cId,
            id,
            response: parseResult({
              json,
              resource,
              config,
              resourceType: determineResourceType({controller})
            })
          })
        })
        .catch((error) => {
          const type = `${resource}.${railsAction}_ERROR`
          const outError = error && error.toString && error.toString()
          store.dispatch({ type, error: outError, id: data.id, cId })
        })
    })
    .catch((error) => {
      const type = `${resource}.${railsAction}_ERROR`
      store.dispatch({ type, error, id: data.id, cId })
    })
}

export default (config) => {
  return (store) => (next) => {
    return (action) => {
      const [ resource, railsAction ] = action.type.split('.')
      const { data, controller, fetchParams } = action
      if (config.resources[resource] && actionMethodMap[railsAction]) {
        fetchResource({store, resource, config, data, railsAction, controllerOverride: controller, fetchParamsOverride: fetchParams})
      }

      return next(action)
    }
  }
}
