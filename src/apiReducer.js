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

const replaceMember = ({idAttribute, data, resourceNameSpace, state, cId}) => {
  const isSingleModel = resourceNameSpace === 'attributes'
  const models = state.models.slice(0) || []
  let currentModel

  if (isSingleModel) { return data }

  currentModel = models.find((model) => {
    return model[idAttribute] === data[idAttribute] || (cId  && model.cId === cId)
  })

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return [
      ...models,
      Object.assign({}, apiDefaultState, data)
    ]
  }

  // model already exists in model array -- replace it.
  return models.map((model) => {
    if (model[idAttribute] === data[idAttribute] || (cId  && model.cId === cId)) {
      return Object.assign({}, model, {
        [idAttribute]: data.id,
        loading: false,
        loadingError: undefined,
        attributes: data
      })
    }

    return model
  })
}

const setMemberLoading = ({idAttribute, id, state, resourceNameSpace}) => {
  // this function sets the loading state of a member
  // works if member exists within a collection or if it's a singular resource

  const isSingleModel = resourceNameSpace === 'attributes'
  const models = state.models || []
  let currentModel

  if (isSingleModel) {
    // single model not in a collection -- update its loading state.
    return Object.assign({}, state.attributes, {
      loading: true
    })
  }

  currentModel = models.find(model => model[idAttribute] === id)

  if (!currentModel) {
    // single model within a collection, but does not yet exist in the collection.
    // Add it to collection and set its loading state.
    return [
      ...models,
      {
        [idAttribute]: id,
        loading: true
      }
    ]
  }

  // single model within a collection -- find it and set its loading state.
  return models.map((model) => {
    if (model[idAttribute] === id) {
      return Object.assign({}, model, { loading: true })
    }

    return model
  })
}

const setMemberLoadingError = ({idAttribute, id, state, resourceNameSpace, error}) => {
  // this function sets the loading error state of a member
  // works if member exists within a collection or if it's a singular resource

  const isSingleModel = resourceNameSpace === 'attributes'
  const models = state.models || []
  let currentModel

  if (isSingleModel) {
    // single model not in a collection -- update its loading state.
    return Object.assign({}, state.attributes, {
      loading: false,
      loadingError: error
    })
  }

  currentModel = models.find(model => model[idAttribute] === id)

  if (!currentModel) {
    // single model within a collection, but does not yet exist in the collection.
    // Add it to collection and set its loading state.
    return [
      ...models,
      {
        [idAttribute]: id,
        loadingError: error,
        loading: false
      }
    ]
  }

  // single model within a collection -- find it and set its loading state.
  return models.map((model) => {
    if (model[idAttribute] === id) {
      return Object.assign({}, model, {
        loading: false,
        loadingError: error
      })
    }

    return model
  })
}

export default (config) => {
    const reducers = {}

    Object.keys(config.resources).forEach((resource) => {
      reducers[resource] = (state = apiDefaultState, action) => {
        switch(action.type) {
          case `${resource}.INDEX`: {
            return Object.assign({}, state, {
              loading: true,
              loadingError: undefined
            })
          }
          case `${resource}.INDEX_SUCCESS`: {
            return Object.assign({}, state, {
              loading: false,
              loadingError: undefined,
              models: action.response
            })
          }
          case `${resource}.INDEX_ERROR`: {
            const { error } = action

            return Object.assign({}, state, {
              loading: false,
              loadingError: error
            })
          }
          case `${resource}.SHOW`: {
            const { id } = action.data
            const resourceNameSpace = getResourceNameSpace({config, resource})
            const idAttribute = getResourceIdAttribute({config, resource})

            return Object.assign({}, state, {
              [resourceNameSpace]: setMemberLoading({idAttribute, id, state, resourceNameSpace})
            })
          }
          case `${resource}.SHOW_SUCCESS`: {
            const data = action.response
            const resourceNameSpace = getResourceNameSpace({config, resource})
            const idAttribute = getResourceIdAttribute({config, resource})

            return Object.assign({}, state, {
              loading: false,
              loadingError: undefined,
              [resourceNameSpace]: replaceMember({idAttribute, data, resourceNameSpace, state})
            })
          }
          case `${resource}.SHOW_ERROR`: {
            const id = action.data && action.data.id
            const { error } = action
            const resourceNameSpace = getResourceNameSpace({config, resource})
            const idAttribute = getResourceIdAttribute({config, resource})

            return Object.assign({}, state, {
              [resourceNameSpace]: setMemberLoadingError({state, id, idAttribute, error, resourceNameSpace})
            })
          }
          case `${resource}.ASSIGN_CID`: {
            const resourceNameSpace = getResourceNameSpace({config, resource})
            const idAttribute = getResourceIdAttribute({config, resource})
            const data = {
              cId: action.cId,
              loading: false,
              loadingError: undefined
            }

            return Object.assign({}, state, {
              loading: false,
              loadingError: undefined,
              [resourceNameSpace]: replaceMember({data, idAttribute, resourceNameSpace, state})
            })
          }
          case `${resource}.CREATE_SUCCESS`: {
            const data = action.response
            const { cId } = action
            const resourceNameSpace = getResourceNameSpace({config, resource})
            const idAttribute = getResourceIdAttribute({config, resource})

            return Object.assign({}, state, {
              loading: false,
              loadingError: undefined,
              [resourceNameSpace]: replaceMember({idAttribute, data, resourceNameSpace, state, cId})
            })
          }
          case `${resource}.CREATE_ERROR`: {
            const id = action.data && action.data.id
            const { error } = action
            const resourceNameSpace = getResourceNameSpace({config, resource})
            const idAttribute = getResourceIdAttribute({config, resource})

            return Object.assign({}, state, {
              [resourceNameSpace]: setMemberLoadingError({state, id, idAttribute, error, resourceNameSpace})
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


/*
  --TODO--
  UPDATE
  DESTROY
*/
