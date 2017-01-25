import {
  determineResourceType,
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

const constructfetchOptions = ({railsAction, resource, config, data}) => {
  // options available match request the fetch Request object:
  // https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
  const method = actionMethodMap[railsAction]
  let options = { method }

  // assume the body is meant to be JSON. Fetch requires you to Stringify JSON
  if (typeof data === 'object' && method !== 'GET') {
    options.body = JSON.stringify(data)
    options.headers = new Headers({'content-type':'application/json'})
  }

  return options
}

const fetchResource = ({store, resource, config, data={}, railsAction}) => {
  const resourceConfig = config.resources[resource]
  const domain = resourceConfig.domain || config.domain
  const controller = resourceConfig.controller
  let cId

  if (railsAction === 'CREATE') {
    cId = getUniqueClientId()
    store.dispatch({ type: `${resource}.ASSIGN_CID`, cId })
  }

  fetch(constructUrl({domain, controller, railsAction, data}), constructfetchOptions({railsAction, resource, data, config}))
    .then((response) => {
      response.json().then((json) => {
        if(!response.ok) {
          return store.dispatch({
            type: `${resource}.${railsAction}_ERROR`,
            error: json.error || { message: response.statusText },
            id: data.id
          })
        }

        store.dispatch({
          type: `${resource}.${railsAction}_SUCCESS`,
          cId,
          id: data.id,
          response: parseResult({
            json,
            resource,
            config,
            resourceType: determineResourceType({controller})
          })
        })
      })
    })
    .catch((error) => {
      const type = `${resource}.${railsAction}_ERROR`
      store.dispatch({ type, error, data })
    })
}

export default (config) => {
  return (store) => (next) => {
    return (action) => {
      const [ resource, railsAction ] = action.type.split('.')
      const { data } = action
      if (config.resources[resource] && actionMethodMap[railsAction]) {
        fetchResource({store, resource, config, data, railsAction})
      }

      return next(action)
    }
  }
}
