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

const replaceMemberAttributes = ({idAttribute, data, state, cId}) => {
  const models = (state.models && state.models.slice(0)) || []
  let currentModel

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

  // model already exists in model array -- replace its attributes.
  return models.map((model) => {
    if (model[idAttribute] !== data[idAttribute] && (!cId  || model.cId !== cId)) {
      return model
    }

    return Object.assign({}, model, {
      [idAttribute]: data.id,
      loading: false,
      loadingError: undefined,
      attributes: data
    })
  })
}

const updateMemberAttributes = ({idAttribute, data, state}) => {
  const models = (state.models && state.models.slice(0)) || []
  const currentModel = models.find(model => model[idAttribute] === data[idAttribute])

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return [
      ...models,
      Object.assign({}, apiDefaultState, { attributes: data })
    ]
  }

  // model already exists in models array -- replace its attributes.
  return models.map((model) => {
    if (model[idAttribute] !== data[idAttribute]) { return model }

    return Object.assign({}, model, {
      loading: false,
      loadingError: undefined,
      attributes: Object.assign({}, model.attributes, data)
    })
  })

}

const destroyMember = ({idAttribute, id, state}) => {
  return state.models.filter(model => model[idAttribute] !== id)
}

const setMemberLoading = ({idAttribute, id, state}) => {
  // this function sets the loading state of a member within a collection
  const models = (state.models && state.models.slice(0)) || []
  const currentModel = models.find(model => id && model[idAttribute] === id)

  if (!currentModel) {
    // model does not yet exist in the collection.
    // Add it to collection and set its loading state.
    return [
      ...models,
      {
        [idAttribute]: id,
        loading: true
      }
    ]
  }

  // model within a collection -- find it and set its loading state.
  return models.map((model) => {
    if (model[idAttribute] === id) {
      return Object.assign({}, model, { loading: true })
    }

    return model
  })
}

const setMemberLoadingError = ({idAttribute, id, state, error}) => {
  // this function sets the loading error state of a member in a collection
  const models = (state.models && state.models.slice(0)) || []
  const currentModel = models.find(model => model[idAttribute] === id)

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
    if (model[idAttribute] !== id) { return model }

    return Object.assign({}, model, {
      loading: false,
      loadingError: error
    })
  })
}

export default (config) => {
    const reducers = {}

    Object.keys(config.resources).forEach((resource) => {
      reducers[resource] = (state = apiDefaultState, action) => {
        const resourceNameSpace = getResourceNameSpace({config, resource})
        const isSingleModel = resourceNameSpace === 'attributes'
        const idAttribute = getResourceIdAttribute({config, resource})

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
          case `${resource}.SHOW_SUCCESS`: {
            const data = action.response

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
              models: replaceMemberAttributes({idAttribute, data, state})
            })
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
            const data = {
              cId: action.cId,
              loading: false,
              loadingError: undefined
            }

            if (isSingleModel) {
              return Object.assign({}, state, data)
            }

            return Object.assign({}, state, {
              loading: false,
              loadingError: undefined,
              models: replaceMemberAttributes({data, idAttribute, state})
            })
          }
          case `${resource}.CREATE_SUCCESS`: {
            const data = action.response
            const { cId } = action

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
              models: replaceMemberAttributes({idAttribute, data, state, cId})
            })
          }
          case `${resource}.CREATE_ERROR`: {
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
          default: {
            return state
          }
        }
      }
    })

    return combineReducers(reducers)
  }
