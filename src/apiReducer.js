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
const findModel = ({idAttribute, id, cId, state}) => {
  // returns model, found by id or cId, from state.models array
  const models = (state.models && state.models.slice(0)) || []

  return models.find((model) => {
    return model[idAttribute] === id || (cId  && model.cId === cId)
  })
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

  return models.map((model) => {
    if (model[idAttribute] !== id && (!cId  || model.cId !== cId)) {
      return model
    }

    return Object.assign({}, model, updatedModel)
  })
}

const replaceMemberAttributes = ({idAttribute, data, state, cId}) => {
  const id = data[idAttribute]
  const currentModel = findModel({idAttribute, id, cId, state})
  let model

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    model = Object.assign({}, apiDefaultState, data)
    return collectionWithNewModel({state, model})
  }

  // model already exists in model array -- replace its attributes.
  return collectionWithUpdatedModel({idAttribute, id, cId, state, updatedModel: {
    [idAttribute]: data[idAttribute],
    loading: false,
    loadingError: undefined,
    attributes: data
  }})
}

const updateMemberAttributes = ({idAttribute, data, state}) => {
  const id = data[idAttribute]
  const currentModel = findModel({idAttribute, id, state})
  let model

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    model = Object.assign({}, apiDefaultState, { attributes: data })
    return collectionWithNewModel({state, model})
  }

  // model already exists in model array -- update its attributes.
  return collectionWithUpdatedModel({idAttribute, id, state, updatedModel: {
    loading: false,
    loadingError: undefined,
    attributes: Object.assign({}, currentModel.attributes, data)
  }})

}

const destroyMember = ({idAttribute, id, state}) => {
  return state.models.filter(model => model[idAttribute] !== id)
}

const setMemberLoading = ({idAttribute, id, state}) => {
  // sets the loading state of a member within a collection
  const currentModel = findModel({idAttribute, id, state})
  let model

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    model = { [idAttribute]: id, loading: true, loadingError: undefined }
    return collectionWithNewModel({state, model})
  }

  // model already exists in model array -- update its loading state.
  model = { loading: true, loadingError: undefined }
  return collectionWithUpdatedModel({idAttribute, id, state, updatedModel: model})
}

const setMemberLoadingError = ({idAttribute, id, state, error}) => {
  // this function sets the loading error state of a member in a collection
  const currentModel = findModel({idAttribute, id, state})

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    model = {
      [idAttribute]: id,
      loadingError: error,
      loading: false
    }
    return collectionWithNewModel({state, model})
  }

  // single model within a collection -- find it and set its loading state.
  return collectionWithUpdatedModel({idAttribute, id, state, updatedModel: {
    loading: false,
    loadingError: error
  }})
}


// main reducer
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
              models: collectionWithAttributesOnMembers({models: action.response, idAttribute})
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
