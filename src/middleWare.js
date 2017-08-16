import {
  determinOptimisticUpdateSetting,
  determineResourceType,
  getResourceIdAttribute,
  getUniqueClientId,
  isBool
 } from './utilities'

 let fetchQueue = {}

 const actionMethodMap = {
   SHOW    : 'GET',
   INDEX   : 'GET',
   CREATE  : 'POST',
   UPDATE  : 'PUT',
   DESTROY : 'DELETE',
 }

const constructQueryParam = (queryParams) => (key) => (
  `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[k])}`
)

const constructQueryParams = (queryParams, railsAction) => {
  if(!queryParams || actionMethodMap[railsAction] !== 'GET') return ''

  const keys = Object.keys(queryParams)

  return keys.map(constructQueryParam(queryParams)).join('&')
}

const constructUrl = ({baseUrl, controller, railsAction, data, fetchParams = {}}) => {
  const resourceType = determineResourceType({controller})
  const urlTail = () => {
    // all actions on a collection, other than index and create, require an id
    if (resourceType === 'collection' && railsAction !== 'INDEX' && railsAction !== 'CREATE'){
      return `/${data.id}`
    }

    return ''
  }

  const queryParams = constructQueryParams(fetchParams.queryParams, railsAction)

  return `${baseUrl}${controller}${urlTail()}${queryParams}`
}

const constructfetchOptions = ({railsAction, resource, config, data, fetchParams={}}) => {
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

const dequeueFetch = ({resource}) => {
  const resourceQueue = getResourceQueue({resource})

  // take this fetch off the queue
  resourceQueue.shift()

  if (resourceQueue.length > 0) {
    fetchResource(resourceQueue[0])
  }
}

const dispatchFetchError = ({store, resource, railsAction, error, id, cId, optimisticUpdateEnabled}) => {
  const type = `${resource}.${railsAction}_ERROR`
  store.dispatch({ type, error, id, cId })

  if (['CREATE', 'UPDATE'].includes(railsAction) && optimisticUpdateEnabled) {
    store.dispatch({ type: `${resource}.UNSET_OPTIMISTIC_DATA`, id, cId })
  }
}

const dispatchFetchSuccess = ({store, resource, railsAction, id, cId, json, config, controller}) => {
  const type = `${resource}.${railsAction}_SUCCESS`
  store.dispatch({type, cId, id,
    response: parseResult({json, resource, config,
      resourceType: determineResourceType({controller})
    })
  })
}

const enqueueFetch = (resource, fetchData) => {
  // adds fetch request to queue by resource
  // and intializes the queue if needed
  const resourceQueue = getResourceQueue({resource})

  resourceQueue.push(fetchData)

  if (resourceQueue.length <= 1) {
    // this is the only queued fetch, so start the queue
    fetchResource(fetchData)
  }
}

const fetchResource = ({store, resource, config, data={}, railsAction, controllerOverride, fetchParamsOverride}) => {
  const resourceConfig = config.resources[resource]
  const baseUrl = resourceConfig.baseUrl || config.baseUrl
  const controller = controllerOverride || resourceConfig.controller
  const idAttribute = getResourceIdAttribute({config, resource})
  const fetchParams = fetchParamsOverride || resourceConfig.fetchParams || config.fetchParams
  const options = constructfetchOptions({railsAction, resource, data, config, fetchParams})
  const url = constructUrl({baseUrl, controller, railsAction, data, fetchParams})
  const optimisticUpdateEnabled = determinOptimisticUpdateSetting({resourceConfig, config})
  let cId

  // NOTE: assigning a cId for new models must happen before optimistic updates
  if (railsAction === 'CREATE') {
    cId = getUniqueClientId()
    store.dispatch({ type: `${resource}.ASSIGN_CID`, cId })
    store.dispatch({ type: `${resource}.SET_LOADING`, cId})
  }

  if (['CREATE', 'UPDATE'].includes(railsAction) && optimisticUpdateEnabled) {
    store.dispatch({ type: `${resource}.SET_OPTIMISTIC_DATA`, id: data.id, cId, data})
  }

  fetch(url, options)
    .then((response) => {
      response.json()
        .then((json) => {
          const id = (json && json[idAttribute]) || data.id

          if(!response.ok) {
            return dispatchFetchError({store, resource, railsAction, id, cId, optimisticUpdateEnabled,
              error: json.error || { message: response.statusText }
            })
          }

          dispatchFetchSuccess({store, resource, railsAction, id, cId, json, config, controller, optimisticUpdateEnabled})
        })
        .catch((error) => {
          const outError = error && error.toString && error.toString()
          dispatchFetchError({store, resource, railsAction, error: outError, id: data.id, cId, optimisticUpdateEnabled})
        })
    })
    .catch((error) => {
      dispatchFetchError({store, resource, railsAction, error, id: data.id, cId, optimisticUpdateEnabled})
    })
    .then(() => dequeueFetch({resource}))
}

const getResourceQueue = ({resource}) => {
  if (!fetchQueue[resource]) {
    fetchQueue[resource] = { queue: [] }
  }

  return fetchQueue[resource].queue
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

export default (config) => {
  return (store) => (next) => {
    return (action) => {
      const [ resource, railsAction ] = action.type.split('.')
      const { data, controller, fetchParams } = action
      const fetchData = {store, resource, config, data, railsAction, controllerOverride: controller, fetchParamsOverride: fetchParams}
      const resourceConfig = config.resources[resource]

      if (resourceConfig && actionMethodMap[railsAction]) {

        if (config.disableFetchQueueing || resourceConfig.disableFetchQueueing) {
          // Fetch queueing disabled, let the fetch run immediately
          fetchResource(fetchData)
        } else {
          enqueueFetch(resource, fetchData)
        }
      }

      return next(action)
    }
  }
}
