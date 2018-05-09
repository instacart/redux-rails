import {
  getResourceNameSpace,
  getResourceIdAttribute,
} from './utilities'

export const apiDefaultState = {
  loading: false,
  loadingError: undefined,
  __prevData: undefined
}

export const findModel = ({id, cId, state}) => {
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

export const createNewModel = ({id, cId, metaData, attributes={}}) => {
  // returns a new model with default metaData.
  // uses optionally passed id, cId and attributes
  let innerData = { id, cId,
    attributes: { ...attributes }
  }

  // squash undefined key/values
  Object.keys(innerData).forEach(key => innerData[key] === undefined ? delete innerData[key] : '')

  return { ...apiDefaultState, ...metaData, ...innerData }
}

export const createNewCollection = ({metaData, models=[]}) => {
  // returns a new collection with default metaData and models array
  return { ...apiDefaultState, ...metaData, models }
}

export const collectionWithNewModel = ({state, model}) => {
  // returns new array with model inserted
  const models = state.models || []

  return [
    ...models,
    model
  ]
}

export const collectionWithUpdatedModel = ({id, cId, state, updatedModel}) => {
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

export const setMemberAttributes = ({id, data, metaData, state, cId, replaceAttributes=true, replaceMeta=true}) => {
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

  newAttributes = replaceAttributes ? data : { ...currentModel.attributes, ...data }

  // keep cId of model around, if it has one
  if (!cId && currentModel.cId) { cId = currentModel.cId }

  // model already exists in model array -- replace its attributes.
  return collectionWithUpdatedModel({id, cId, state,
    updatedModel: createNewModel({id, cId, metaData, attributes: newAttributes})
  })
}

export const destroyMember = ({id, state}) => {
  return state.models.filter(model => model.id !== id)
}

export const destroyTempMemeber = ({cId, state}) => {
  return state.models.filter(model => model.cId !== cId)
}

export const setMemberLoading = ({id, cId, state, queryParams}) => {
  // sets the loading state of a member within a collection
  const currentModel = findModel({id, cId, state})

  if (!currentModel) {
    // model does not yet exist in models array -- create it.
    return collectionWithNewModel({state,
      model: createNewModel({id, cId,
        metaData: { loading: true, queryParams }
      })
    })
  }

  // model already exists in model array -- update its loading state.
  return collectionWithUpdatedModel({id, cId, state,
    updatedModel: createNewModel({id, cId,
      metaData: { loading: true, queryParams },
      attributes: currentModel.attributes
    }
  )})
}

export const setMemberLoadingError = ({id, cId, state, error}) => {
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

export const getInitialState = ({config, resource}) => {
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

export default {
  apiDefaultState,
  findModel,
  createNewModel,
  createNewCollection,
  collectionWithNewModel,
  collectionWithUpdatedModel,
  setMemberAttributes,
  destroyMember,
  destroyTempMemeber,
  setMemberLoading,
  setMemberLoadingError,
  getInitialState,
}
