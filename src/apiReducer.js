import { combineReducers } from 'redux'
import {
  getResourceNameSpace,
  getResourceIdAttribute,
  getUniqueClientId
} from './utilities'

const apiDefaultState = {
  loading: false,
  loadingError: undefined
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

const collectionWithAttributesOnMembers = ({models=[], idAttribute}) => {
  // returns new collection with members containing attributes
  // ie. [{ id: 123, foo: 'bar' }] -> [{ id: 123, loading: false, loadingError: undefined, attributes: { id: 123, foo: 'bar' } }]
  return models.map((model) => {
    return Object.assign({}, apiDefaultState, {
      id: model[idAttribute],
      attributes: model
    })
  })
}

const collectionWithNewModel = ({state, model}) => {
  // returns new array with model inserted
  const models = state.models || []

  return [
    ...models,
    model
  ]
}

const collectionWithUpdatedModel = ({idAttribute, id, cId, state, updatedModel}) => {
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

const replaceMemberAttributes = ({id, idAttribute, data, metaData, state, cId}) => {
  const currentModel = findModel({id, cId, state})

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return collectionWithNewModel({state,
      model: createNewModel({id, cId, idAttribute, metaData})
    })
  }

  // model already exists in model array -- replace its attributes.
  return collectionWithUpdatedModel({idAttribute, id, cId, state,
    updatedModel: createNewModel({id, cId, idAttribute, metaData, attributes: data})
  })
}

const updateMemberAttributes = ({idAttribute, data, state}) => {
  const id = data[idAttribute]
  const currentModel = findModel({id, state})

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return collectionWithNewModel({state,
      model: Object.assign({}, apiDefaultState, {
        [idAttribute]: id,
        attributes: data
      })
    })
  }

  // model already exists in model array -- update its attributes.
  return collectionWithUpdatedModel({idAttribute, id, state,
    updatedModel: createNewModel({id, idAttribute,
      attributes: Object.assign({}, currentModel.attributes, data)
    }
  )})

}

const destroyMember = ({idAttribute, id, state}) => {
  return state.models.filter(model => model[idAttribute] !== id)
}

const setMemberLoading = ({idAttribute, id, cId, state}) => {
  // sets the loading state of a member within a collection
  const currentModel = findModel({id, cId, state})

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return collectionWithNewModel({state,
      model: createNewModel({id, cId, idAttribute,
        metaData: {loading: true}
      })
    })
  }

  // model already exists in model array -- update its loading state.
  return collectionWithUpdatedModel({idAttribute, id, cId, state,
    updatedModel: createNewModel({id, cId, idAttribute,
      metaData: { loading: true },
      attributes: currentModel.attributes
    }
  )})
}

const setMemberLoadingError = ({idAttribute, id, cId, state, error}) => {
  // this function sets the loading error state of a member in a collection
  const currentModel = findModel({id, cId, state})

  if (!currentModel && !id) { return state.models.slice(0) }

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return collectionWithNewModel({state,
      model: createNewModel({id, idAttribute,
        metaData: { loadingError: error }
      })
    })
  }

  // single model within a collection -- find it and set its loading state.
  return collectionWithUpdatedModel({idAttribute, id, state, cId,
    updatedModel: createNewModel({...currentModel, idAttribute,
      metaData: { loadingError: error }
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

        switch(action.type) {
          case `${resource}.INDEX`: {
            return Object.assign({}, state, createNewCollection({
              metaData: {
                loading: true
              }
            }))
          }
          case `${resource}.INDEX_SUCCESS`: {
            return Object.assign({}, state, createNewCollection({
              models: collectionWithAttributesOnMembers({models: action.response, idAttribute})
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
              return createNewModel({...state,
                metaData: { loading: true }
              })
            }

            return Object.assign({}, state, {
              models: setMemberLoading({idAttribute, id, state})
            })
          }
          case `${resource}.SHOW_SUCCESS`: {
            const { id } = action
            const data = action.response

            if (isSingleModel) {
              return createNewModel({...state,
                metaData: { loading: false },
                attributes: data
              })
            }

            return Object.assign({}, state, createNewCollection({
              models: replaceMemberAttributes({id, idAttribute, data, state, metaData: {
                loading: false
              }})
            }))
          }
          case `${resource}.SHOW_ERROR`: {
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
          case `${resource}.ASSIGN_CID`: {
            const { cId } = action
            const data = {
              loading: false,
              loadingError: undefined
            }

            if (isSingleModel) {
              return Object.assign({}, state, data)
            }

            return Object.assign({}, state, {
              loading: false,
              loadingError: undefined,
              models: replaceMemberAttributes({data, cId, idAttribute, state})
            })
          }
          case `${resource}.CREATE_SUCCESS`: {
            const data = action.response
            const { cId, id } = action

            if (isSingleModel) {
              return Object.assign({}, state, {
                loading: false,
                loadingError: undefined,
                attributes: Object.assign({}, state.attributes, data)
              })
            }

            return Object.assign({}, state, {
              loading: false,
              loadingError: undefined,
              models: replaceMemberAttributes({idAttribute, data, state, id, cId})
            })
          }
          case `${resource}.CREATE_ERROR`: {
            const { id, cId, error } = action

            if (isSingleModel) {
              return Object.assign({}, state, {
                loading: false,
                loadingError: error
              })
            }

            return Object.assign({}, state, {
              models: setMemberLoadingError({state, id, cId, idAttribute, error})
            })
          }
          case `${resource}.UPDATE`: {
            const data = action.data || {}
            const { id } = data

            if (isSingleModel) {
              return Object.assign({}, state, {
                loading: true,
                loadingError: undefined
              })
            }

            return Object.assign({}, state, {
              models: setMemberLoading({idAttribute, id, state})
            })
          }
          case `${resource}.UPDATE_SUCCESS`: {
            const data = action.response

            if (isSingleModel) {
              return Object.assign({}, state, {
                loading: false,
                loadingError: undefined,
                attributes: Object.assign({}, state.attributes, data)
              })
            }

            return Object.assign({}, state, {
              models: updateMemberAttributes({idAttribute, data, state})
            })
          }
          case `${resource}.UPDATE_ERROR`: {
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
          case `${resource}.DESTROY`: {
            const data = action.data || {}
            const { id } = data

            if (isSingleModel) {
              return Object.assign({}, state, {
                loading: true,
                loadingError: undefined
              })
            }

            return Object.assign({}, state, {
              models: setMemberLoading({idAttribute, id, state})
            })
          }
          case `${resource}.DESTROY_SUCCESS`: {
            const { id } = action

            if (isSingleModel) { return apiDefaultState }

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
            // but this is useufl for resources being created on client
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
          default: {
            return state
          }
        }
      }
    })

    return combineReducers(reducers)
  }
