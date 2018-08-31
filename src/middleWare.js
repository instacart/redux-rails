import {
  determinOptimisticUpdateSetting,
  determineResourceType,
  getConfig,
  getResourceIdAttribute,
  getUniqueClientId,
 } from './utilities'

 let fetchQueue = {}

 const actionMethodMap = {
   SHOW    : 'GET',
   INDEX   : 'GET',
   CREATE  : 'POST',
   UPDATE  : 'PUT',
   DESTROY : 'DELETE',
 }


const constructBaseQueryParam = (key, value) => (
  `${key}=${encodeURIComponent(value)}`
)

const constructArrayQueryParam = (key, values) => (
  values.map(value => constructBaseQueryParam(`${key}[]`, value))
)

const constructQueryParam = (key, value) => (
  Array.isArray(value)
    ? constructArrayQueryParam(key, value)
    : constructBaseQueryParam(key, value)
)

const constructQueryParams = (queryParams = {}, railsAction) => {
  // Do not construct query string for keys with undefined values
  const keys = Object.keys(queryParams).filter(
    key => queryParams[key] !== undefined || queryParams[key] !== null
  )

  if(keys.length === 0 || actionMethodMap[railsAction] !== 'GET') return ''

  const queryString = keys.map(key => constructQueryParam(key, queryParams[key])).join('&')

  return `?${queryString}`
}

const isNestedResource = (controller) => controller.includes('/:id/')

const constructUrl = ({baseUrl, controller, railsAction, data, queryParams = {}}) => {
  const resourceType = determineResourceType({controller})
  const isNested = isNestedResource(controller)
  const urlTail = () => {
    // all actions on a collection, other than index and create, require an id
    if (isNested || (resourceType === 'collection' && railsAction !== 'INDEX' && railsAction !== 'CREATE')){
      return `/${data.id}`
    }

    return ''
  }

  const queryString = constructQueryParams(queryParams, railsAction)

  let base
  if(isNested) {
    base = `${baseUrl}${controller}`.replace('/:id', urlTail())
  } else {
    base = `${baseUrl}${controller}${urlTail()}`
  }

  return `${base}${queryString}`
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

const dispatchFetchError = ({store, resource, railsAction, error, id, cId, optimisticUpdateEnabled, reject}) => {
  const type = `${resource}.${railsAction}_ERROR`
  const payload = { type, error, id, cId }
  const destroy = railsAction === 'CREATE'
  store.dispatch(payload)

  if (['CREATE', 'UPDATE'].includes(railsAction) && optimisticUpdateEnabled) {
    store.dispatch({ type: `${resource}.UNSET_OPTIMISTIC_DATA`, id, cId, destroy })
  }

  reject(payload)
}

const dispatchFetchSuccess = ({store, resource, railsAction, id, cId, json, config, controller, resolve}) => {
  const type = `${resource}.${railsAction}_SUCCESS`
  const { response, metaData } = parseResult({json, resource, config,
    resourceType: determineResourceType({controller})
  })
  const payload = { cId, id, metaData, response, type }

  store.dispatch(payload)
  resolve(payload)
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

const fetchResource = ({store, resource, config, data={}, railsAction, controllerOverride, fetchParamsOverride, queryParamsOverride, resolve, reject}) => {
  const resourceConfig = config.resources[resource]
  const baseUrl = resourceConfig.baseUrl || config.baseUrl
  const controller = controllerOverride || resourceConfig.controller
  const idAttribute = getResourceIdAttribute({config, resource})
  const fetchParams = fetchParamsOverride || resourceConfig.fetchParams || config.fetchParams
  const queryParams = queryParamsOverride || resourceConfig.queryParams || config.queryParams
  const options = constructfetchOptions({railsAction, resource, data, config, fetchParams})
  const url = constructUrl({baseUrl, controller, railsAction, data, fetchParams, queryParams})
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
            return dispatchFetchError({store, resource, railsAction, id, cId, optimisticUpdateEnabled, reject,
              error: json.error || { message: response.statusText }
            })
          }

          dispatchFetchSuccess({store, resource, railsAction, id, cId, json, config, controller, optimisticUpdateEnabled, resolve})
        })
        .catch((error) => {
          const outError = error && error.toString && error.toString()
          dispatchFetchError({store, resource, railsAction, error: outError, id: data.id, cId, optimisticUpdateEnabled, reject})
        })
    })
    .catch((error) => {
      dispatchFetchError({store, resource, railsAction, error, id: data.id, cId, optimisticUpdateEnabled, reject})
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
  const resourceMeta = config.resources[resource].setMetadata
  let response
  let metaData = {}

  // parse and metaData methods can be defined per resousrce type or
  // as a catchall for all resource types
  switch(typeof resourceParse) {
    case 'object': {
      const parseMethod = resourceParse && resourceParse[resourceType]
      if (!parseMethod) {
        response = json
        break
      }

      response = parseMethod(json)
      break
    }
    case 'function': {
      response = resourceParse(json)
      break
    }
    default: {
      response = json
      break
    }
  }

  switch(typeof resourceMeta) {
    case 'object': {
      const setMetadata = resourceMeta && resourceMeta[resourceType]
      if (!setMetadata) { break }

      metaData = setMetadata(json)
      break
    }
    case 'function': {
      metaData = resourceMeta(json)
      break
    }
    default: {
      metaData = {}
      break
    }
  }

  return { response, metaData }
}

const handleAction = ({action, config, fetchData, next, resource, resourceConfig}) => {
  const promise = new Promise((resolve, reject) => {
    const data = { resolve, reject, ...fetchData }

    if (config.disableFetchQueueing || resourceConfig.disableFetchQueueing) {
      // Fetch queueing disabled, let the fetch run immediately
      fetchResource(data)
    }

    enqueueFetch(resource, data)
  })

  next(action)
  return promise
}

export default (inConfig) => {
  return (store) => (next) => {
    return (action) => {
      const config = getConfig({config: inConfig, store: store.getState()})
      const [ resource, railsAction ] = action.type.split('.')
      const { data, controller, fetchParams } = action
      const { queryParams } = data || {}
      const fetchData = {
        store,
        resource,
        config,
        data,
        railsAction,
        controllerOverride: controller,
        fetchParamsOverride: fetchParams,
        queryParamsOverride: queryParams
      }
      const resourceConfig = config.resources[resource]

      // action does not have fetching side effects
      if (!resourceConfig || !actionMethodMap[railsAction]) { return next(action) }

      return handleAction({action, config, fetchData, next, resource, resourceConfig})
    }
  }
}
