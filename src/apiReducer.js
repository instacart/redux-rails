import { combineReducers } from 'redux'
import {
  getResourceNameSpace,
  getResourceIdAttribute,
  getUniqueClientId
} from './utilities'

const apiDefaultState = {
  loading: false,
  loadingError: undefined,
  __prevData: undefined
}

// reducer utilities
const findModel = ({id, cId, state}) => {
  // returns model, found by id or cId, from state.models array
  const models = (state.models && state.models.slice(0)) || []
  let hasId
  let hasCid

  return models.find((model) => {
    hasId = typeof model.id !== 'undefined'
    hasCid = typeof cId !== 'undefined'
    return (hasId && model.id === id) || (hasCid && model.cId === cId)
  })
}

const createNewModel = ({id, cId, metaData, attributes={}}) => {
  // returns a new model with default metaData.
  // uses optionally passed id, cId and attributes
  let innerData = { id, cId,
    attributes: Object.assign({}, attributes)
  }

  // squash undefined key/values
  Object.keys(innerData).forEach(key => innerData[key] === undefined ? delete innerData[key] : '')

  return Object.assign({}, apiDefaultState, metaData, innerData)
}

const createNewCollection = ({metaData, models=[]}) => {
  // returns a new collection with default metaData and models array
  return Object.assign({}, apiDefaultState, metaData, { models })
}

const collectionWithNewModel = ({state, model}) => {
  // returns new array with model inserted
  const models = state.models || []

  return [
    ...models,
    model
  ]
}

const collectionWithUpdatedModel = ({id, cId, state, updatedModel}) => {
  // returns collection (models array) with model's attributes updated
  const models = (state.models && state.models.slice(0)) || []
  let hasId
  let hasCid

  return models.map((model) => {
    hasId = typeof model.id !== 'undefined'
    hasCid = typeof cId !== 'undefined'

    if ((!hasId || model.id !== id) && (!hasCid  || model.cId !== cId)) {
      return model
    }

    return updatedModel
  })
}

const setMemberAttributes = ({id, data, metaData, state, cId, replaceAttributes=true, replaceMeta=true}) => {
  const currentModel = findModel({id, cId, state})
  let newAttributes
  let currentMeta = {}
  let newMeta = metaData

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return collectionWithNewModel({state,
      model: createNewModel({id, cId, metaData, attributes: data})
    })
  }

  newAttributes = replaceAttributes ? data : Object.assign({}, currentModel.attributes, data)

  // keep cId of model around, if it has one
  if (!cId && currentModel.cId) { cId = currentModel.cId }

  // model already exists in model array -- replace its attributes.
  return collectionWithUpdatedModel({id, cId, state,
    updatedModel: createNewModel({id, cId, metaData, attributes: newAttributes})
  })
}

const destroyMember = ({id, state}) => {
  return state.models.filter(model => model.id !== id)
}

const setMemberLoading = ({id, cId, state}) => {
  // sets the loading state of a member within a collection
  const currentModel = findModel({id, cId, state})

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return collectionWithNewModel({state,
      model: createNewModel({id, cId,
        metaData: { loading: true }
      })
    })
  }

  // model already exists in model array -- update its loading state.
  return collectionWithUpdatedModel({id, cId, state,
    updatedModel: createNewModel({id, cId,
      metaData: { loading: true },
      attributes: currentModel.attributes
    }
  )})
}

const setMemberLoadingError = ({id, cId, state, error}) => {
  // this function sets the loading error state of a member in a collection
  const currentModel = findModel({id, cId, state})

  if (!currentModel && !id) { return state.models.slice(0) }

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return collectionWithNewModel({state,
      model: createNewModel({id,
        metaData: { loadingError: error }
      })
    })
  }

  // single model within a collection -- find it and set its loading state.
  return collectionWithUpdatedModel({id, state, cId,
    updatedModel: createNewModel({...currentModel,
      metaData: { loadingError: error, __prevData: currentModel.__prevData }
    }
  )})
}

const getInitialState = ({config, resource}) => {
  // converts models/attributes passed in with the config to match
  // redux rais internal models/collections
  // If not models/attributes present, returns apiDefaultState
  const resourceNameSpace = getResourceNameSpace({config, resource})
  const isSingleModel = resourceNameSpace === 'attributes'
  const resourceConfig = config.resources[resource] || {}
  const idAttribute = getResourceIdAttribute({config, resource})
  let id

  if (isSingleModel) {
    id = resourceConfig[resourceNameSpace] ?
      resourceConfig[idAttribute] ||
      resourceConfig.attributes[idAttribute] :
      undefined

    return createNewModel({id, idAttribute,
      attributes: resourceConfig.attributes
    })
  }

  return createNewCollection({
    models: (resourceConfig.models || []).map(m => createNewModel({
      idAttribute,
      id: m[idAttribute],
      attributes: m
    }))
  })

}


// main reducer
export default (config) => {
  const reducers = {}

  Object.keys(config.resources).forEach((resource) => {
    reducers[resource] = (state = getInitialState({config, resource}), action) => {
      const resourceNameSpace = getResourceNameSpace({config, resource})
      const isSingleModel = resourceNameSpace === 'attributes'
      const idAttribute = getResourceIdAttribute({config, resource})
      const { queryParams } = action.data || {}
      switch(action.type) {
        case `${resource}.INDEX`: {
          return Object.assign({}, state, createNewCollection({
            metaData: {
              loading: true,
              queryParams
            }
          }))
        }
        case `${resource}.INDEX_SUCCESS`: {
          let response = action.response
          const responseResource = action.response[resource] || action.response[resource.toLowerCase()]

          if (!Array.isArray(action.response)) {
            if (responseResource && Array.isArray(responseResource)) {
              // if top level key exists in response, and is an array, use that as data
              // this is essentially an automatic parse, since top level responses being an array
              // is a security issue for many sites
              response = responseResource
            } else {
              console.error('Response to INDEX actions must be of type array OR contain a top-level key matching the resource name with an array as the value. You can use the parse method(s) set in your config for this resource to transform returned data if needed.')

              return Object.assign({}, state, createNewCollection({
                metaData: {
                  loading: false,
                  loadingError: 'Bad data received from server. INDEX calls expect an array.'
                }
              }))
            }
          }

          return Object.assign({}, state, createNewCollection({
            models: response.map(model => createNewModel({
              id: model[idAttribute],
              attributes: model
            }))
          }))
        }
        case `${resource}.INDEX_ERROR`: {
          const { error } = action

          return Object.assign({}, state, createNewCollection({
            metaData: {
              loading: false,
              loadingError: error
            }
          }))
        }
        case `${resource}.SHOW`: {
          const data = action.data || {}
          const { id } = data

          if (isSingleModel) {
            return createNewModel({
              metaData: { loading: true, queryParams },
              attributes: state.attributes
            })
          }

          return Object.assign({}, state, {
            models: setMemberLoading({id, state})
          })
        }
        case `${resource}.SHOW_SUCCESS`: {
          const { id } = action
          const data = action.response

          if (isSingleModel) {
            return createNewModel({id,
              attributes: Object.assign({}, state.attributes, data)
            })
          }

          return Object.assign({}, state, createNewCollection({
            models: setMemberAttributes({id, data, state,
              metaData: { loading: false }
            })
          }))
        }
        case `${resource}.SHOW_ERROR`: {
          const { id, error } = action

          if (isSingleModel) {
            return createNewModel({id,
              attributes: Object.assign({}, state.attributes),
              metaData: { loadingError: error }
            })
          }

          return Object.assign({}, state, {
            models: setMemberLoadingError({state, id, error})
          })
        }
        case `${resource}.ASSIGN_CID`: {
          const { cId } = action

          if (isSingleModel) {
            return createNewModel({cId})
          }

          return createNewCollection({
            models: setMemberAttributes({cId, state})
          })
        }
        case `${resource}.CREATE_SUCCESS`: {
          const data = action.response
          const { cId, id } = action

          if (isSingleModel) {
            return createNewModel({id, cId,
              attributes: Object.assign({}, state.attributes, data)
            })
          }

          return createNewCollection({
            models: setMemberAttributes({data, state, id, cId})
          })
        }
        case `${resource}.CREATE_ERROR`: {
          const { id, cId, error } = action

          if (isSingleModel) {
            return createNewModel({id, cId,
              metaData: { loadingError: error }
            })
          }

          return Object.assign({}, state, {
            models: setMemberLoadingError({state, id, cId, error})
          })
        }
        case `${resource}.UPDATE`: {
          const data = action.data || {}
          const { id } = data
          const __prevData = state.__prevData

          if (isSingleModel) {
            return createNewModel({id,
              metaData: { loading: true, __prevData},
              attributes: state.attributes
            })
          }

          return Object.assign({}, state, {
            models: setMemberLoading({id, state})
          })
        }
        case `${resource}.UPDATE_SUCCESS`: {
          const { id } = action
          const data = action.response

          if (isSingleModel) {
            return createNewModel({id,
              attributes: Object.assign({}, state.attributes, data)
            })
          }

          return Object.assign({}, state, {
            models: setMemberAttributes({id, data, state, replaceAttributes: false})
          })
        }
        case `${resource}.UPDATE_ERROR`: {
          const { id, error } = action

          if (isSingleModel) {
            return createNewModel({id,
              attributes: state.attributes,
              metaData: { loadingError: error }
            })
          }

          return Object.assign({}, state, {
            models: setMemberLoadingError({state, id, error})
          })
        }
        case `${resource}.DESTROY`: {
          const data = action.data || {}
          const id = data.id || state.id

          if (isSingleModel) {
            return createNewModel({id,
              attributes: state.attributes,
              metaData: { loading: true }
            })
          }

          return Object.assign({}, state, {
            models: setMemberLoading({idAttribute, id, state})
          })
        }
        case `${resource}.DESTROY_SUCCESS`: {
          const { id } = action

          if (isSingleModel) {
            return null
          }

          return Object.assign({}, state, {
            models: destroyMember({idAttribute, id, state})
          })
        }
        case `${resource}.DESTROY_ERROR`: {
          const { id, error } = action

          if (isSingleModel) {
            return Object.assign({}, state, {
              loading: false,
              loadingError: error
            })
          }

          return Object.assign({}, state, {
            models: setMemberLoadingError({state, id, idAttribute, error})
          })
        }
        case `${resource}.SET_LOADING`: {
          // generally loading state is set in the base rails action,
          // but this is useful for resources being created on client
          const { id, cId } = action

          if (isSingleModel) {
            return Object.assign({}, state, {
              loading: true,
              loadingError: undefined
            })
          }

          return Object.assign({}, state, {
            models: setMemberLoading({idAttribute, id, cId, state})
          })

        }
        case `${resource}.SET_OPTIMISTIC_DATA`: {
          const { id, cId, data } = action
          const currentModel = isSingleModel ? state : findModel({id, cId, state})
          const __prevData = Object.assign({}, currentModel.attributes)
          let currentMeta = {}
          let newMeta

          Object.keys(apiDefaultState).forEach((metaKey) => {
            currentMeta[metaKey] = currentModel[metaKey]
          })

          newMeta = Object.assign({}, currentMeta, { __prevData })

          if (isSingleModel) {
            return createNewModel({id, cId,
              attributes: Object.assign({}, currentModel.attributes, data),
              metaData: newMeta
            })
          }

          return createNewCollection({
            models: setMemberAttributes({data, state, id, cId, metaData: newMeta})
          })
        }
        case `${resource}.UNSET_OPTIMISTIC_DATA`: {
          const { id, cId } = action
          const currentModel = isSingleModel ? state : findModel({id, cId, state})

          if (isSingleModel) {
            return createNewModel({id, cId,
              attributes: currentModel.__prevData
            })
          }

          return createNewCollection({
            models: setMemberAttributes({data: currentModel.__prevData, state, id, cId})
          })
        }
        default: {
          const resourceConfig = config.resources[resource]

          if (resourceConfig && resourceConfig.reducer) {
            // additional action handlers supplied through config
            return resourceConfig.reducer(state, action)
          }

          return state
        }
      }
    }
  })

  return combineReducers(reducers)
}
