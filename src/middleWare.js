import {
  determineResourceType,
  getUniqueClientId
 } from './utilities'

const parseResult = ({json, resource, config, resourceType}) => {
  const parseMethods = config.resources[resource].parse
  const parseMethod = parseMethods && parseMethods[resourceType]

  if (!parseMethods || !parseMethod) { return json }

  return parseMethod(json)
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

const constructfetchOptions = ({httpMethod, resource, config, data}) => {
  // options available match request the fetch Request object:
  // https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
  let options = {
    method: httpMethod
  }

  // assume the body is meant to be JSON. Fetch requires you to Stringify JSON
  if (typeof data === 'object' && httpMethod.toUpperCase() !== 'GET') {
    options.body = JSON.stringify(data)
    options.headers = new Headers({'content-type':'application/json'})
  }

  return options
}

const fetchResource = ({store, resource, config, data, cId, railsAction, httpMethod}) => {
  const resourceConfig = config.resources[resource]
  const domain = resourceConfig.domain || config.domain
  const controller = resourceConfig.controller

  fetch(constructUrl({domain, controller, railsAction, data}), constructfetchOptions({httpMethod, resource, data, config}))
    .then((response) => {
      response.json().then((json) => {
        if(!response.ok) {
          return store.dispatch({
            type: `${resource}.${railsAction}_ERROR`,
            error: json.error,
            data
          })
        }

        store.dispatch({
          type: `${resource}.${railsAction}_SUCCESS`,
          cId,
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

const assignCid = ({resource}) => {
  return new Promise((resolve, reject) => {
    const cId = getUniqueClientId()
    siteApp.dispatch({ type: `${resource}.ASSIGN_CID`, cId })
    resolve(cId)
  })
}

// show, index, create, update, destroy
const apiMethods = {
  SHOW:    ({store, resource, config, data}) => fetchResource({store, resource, config, data, railsAction: 'SHOW', httpMethod: 'GET'}),
  INDEX:   ({store, resource, config, data}) => fetchResource({store, resource, config, data, railsAction: 'INDEX', httpMethod: 'GET'}),
  CREATE:  ({store, resource, config, data}) => {
    assignCid({resource}).then((cId) => {
      fetchResource({store, resource, config, data, cId, railsAction: 'CREATE', httpMethod: 'POST'})
    })
  },
  UPDATE:  ({store, resource, config, data}) => fetchResource({store, resource, config, data, railsAction: 'UPDATE', httpMethod: 'PUT'}),
  DESTROY: ({store, resource, config, data}) => fetchResource({store, resource, config, data, railsAction: 'DESTROY', httpMethod: 'DELETE'})
}

export default (config) => {
  return (store) => (next) => {
    return (action) => {
      const [ resource, method ] = action.type.split('.')
      const { data } = action
      if (config.resources[resource] && apiMethods[method]) {
        apiMethods[method]({store, resource, config, data})
      }

      return next(action)
    }
  }
}
