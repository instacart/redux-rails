import { combineReducers } from 'redux'
import {
  apiDefaultState,
  findModel,
  createNewModel,
  createNewCollection,
  setMemberAttributes,
  destroyMember,
  destroyTempMemeber,
  setMemberLoading,
  setMemberLoadingError,
  getInitialState,
} from './reducerUtils'
import {
  getConfig,
  getResourceNameSpace,
  getResourceIdAttribute,
} from './utilities'

// main reducer
export default (inConfig) => {
  const config = getConfig({config: inConfig})
  const reducers = {}

  Object.keys(config.resources).forEach((resource) => {
    reducers[resource] = (state = getInitialState({config, resource}), action = {}) => {
      const resourceConfig = config.resources[resource] || {}
      const resourceNameSpace = getResourceNameSpace({config, resource})
      const isSingleModel = resourceNameSpace === 'attributes'
      const idAttribute = getResourceIdAttribute({config, resource})
      const { queryParams } = action.data || {}
      
      switch(action.type) {
        case `${resource}.INDEX`: {
          const { paginated } = resourceConfig

          return {
            ...state,
            ...createNewCollection({
              metaData: {
                loading: true,
                queryParams
              },
              models: paginated ? state.models : []
            })
          }
        }
        case `${resource}.INDEX_SUCCESS`: {
          let { response, metaData } = action
          const responseResource = action.response[resource] || action.response[resource.toLowerCase()]

          if (!Array.isArray(action.response)) {
            if (responseResource && Array.isArray(responseResource)) {
              // if top level key exists in response, and is an array, use that as data
              // this is essentially an automatic parse, since top level responses being an array
              // is a security issue for many sites
              response = responseResource
            } else {
              console.error('Response to INDEX actions must be of type array OR contain a top-level key matching the resource name with an array as the value. You can use the parse method(s) set in your config for this resource to transform returned data if needed.')

              return {
                ...state,
                ...createNewCollection({
                  metaData: {
                    loading: false,
                    loadingError: 'Bad data received from server. INDEX calls expect an array.'
                  }
                })
              }
            }
          }

          if (resourceConfig.paginated) {
            // merge new models into existing models
            // prefer response's model data over existing model data
            const newResponseIds = response.reduce((memo, r) => ({ ...memo, [r.id]: true }), {})
            response = [
              ...state.models.map(m => m.attributes).filter(m => !newResponseIds[m.id]),
              ...response
            ]
          }

          return {
            ...state,
            ...createNewCollection({
              models: response.map(model => createNewModel({
                id: model[idAttribute],
                attributes: model
              })),
              metaData
            })
          }
        }
        case `${resource}.INDEX_ERROR`: {
          const { error } = action

          return {
            ...state,
            ...createNewCollection({
              metaData: {
                loading: false,
                loadingError: error
              }
            })
          }
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

          return {
            ...state,
            ...{ models: setMemberLoading({id, state, queryParams}) }
          }
        }
        case `${resource}.SHOW_SUCCESS`: {
          const { id, response, metaData } = action
          const data = response

          if (isSingleModel) {
            return createNewModel({id, metaData,
              attributes: { ...state.attributes, ...data }
            })
          }

          return {
            ...state,
            ...createNewCollection({
              models: setMemberAttributes({id, data, state,
                metaData: { loading: false, ...metaData }
              })
            })
          }
        }
        case `${resource}.SHOW_ERROR`: {
          const { id, error } = action

          if (isSingleModel) {
            return createNewModel({id,
              attributes: { ...state.attributes },
              metaData: { loadingError: error }
            })
          }

          return {
            ...state,
            ...{ models: setMemberLoadingError({state, id, error}) }
          }
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
          const { cId, id, response, metaData } = action
          const data = response

          if (isSingleModel) {
            return createNewModel({id, cId,
              attributes: { ...state.attributes, ...data },
              metaData
            })
          }

          return createNewCollection({
            models: setMemberAttributes({data, state, id, cId, metaData})
          })
        }
        case `${resource}.CREATE_ERROR`: {
          const { id, cId, error } = action

          if (isSingleModel) {
            return createNewModel({id, cId,
              metaData: { loadingError: error }
            })
          }

          return {
            ...state,
            ...{ models: setMemberLoadingError({state, id, cId, error}) }
          }
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

          return {
            ...state,
            ...{ models: setMemberLoading({id, state}) }
          }
        }
        case `${resource}.UPDATE_SUCCESS`: {
          const { id, metaData, response } = action
          const data = response

          if (isSingleModel) {
            return createNewModel({id,
              attributes: { ...state.attributes, ...data },
              metaData
            })
          }

          return {
            ...state,
            ...{ models: setMemberAttributes({id, data, metaData, state, replaceAttributes: false}) }
          }
        }
        case `${resource}.UPDATE_ERROR`: {
          const { id, error } = action

          if (isSingleModel) {
            return createNewModel({id,
              attributes: state.attributes,
              metaData: { loadingError: error }
            })
          }

          return {
            ...state,
            ...{ models: setMemberLoadingError({state, id, error}) }
          }
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

          return {
            ...state,
            ...{ models: setMemberLoading({idAttribute, id, state}) }
          }
        }
        case `${resource}.DESTROY_SUCCESS`: {
          const { id } = action

          if (isSingleModel) {
            return null
          }

          return {
            ...state,
            ...{ models: destroyMember({idAttribute, id, state}) }
          }
        }
        case `${resource}.DESTROY_ERROR`: {
          const { id, error } = action

          if (isSingleModel) {
            return { 
              ...state,
              ...{
                loading: false,
                loadingError: error
              }
            }
          }

          return {
            ...state,
            ...{ models: setMemberLoadingError({state, id, idAttribute, error}) }
          }
        }
        case `${resource}.SET_LOADING`: {
          // generally loading state is set in the base rails action,
          // but this is useful for resources being created on client
          const { id, cId } = action

          if (isSingleModel) {
            return {
              ...state,
              ...{
                loading: true,
                loadingError: undefined
              }
            }
          }

          return {
            ...state,
            ...{ models: setMemberLoading({idAttribute, id, cId, state}) }
          }
        }
        case `${resource}.SET_OPTIMISTIC_DATA`: {
          const { id, cId, data } = action
          const currentModel = isSingleModel ? state : findModel({id, cId, state})
          const __prevData = { ...currentModel.attributes }
          let currentMeta = {}
          let newMeta

          Object.keys(apiDefaultState).forEach((metaKey) => {
            currentMeta[metaKey] = currentModel[metaKey]
          })

          newMeta = { ...currentMeta, __prevData }

          if (isSingleModel) {
            return createNewModel({id, cId,
              attributes: { ...currentModel.attributes, ...data },
              metaData: newMeta
            })
          }

          return createNewCollection({
            models: setMemberAttributes({data, state, id, cId, metaData: newMeta})
          })
        }
        case `${resource}.UNSET_OPTIMISTIC_DATA`: {
          const { id, cId, destroy } = action
          const currentModel = isSingleModel ? state : findModel({id, cId, state})

          
          if (destroy && isSingleModel) { return null }
          if (destroy) { 
            return {
              ...state,
              ...{ models: destroyTempMemeber({cId, state}) }
            }
          }

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
