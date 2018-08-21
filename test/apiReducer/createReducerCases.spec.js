import apiReducer from '../../src/apiReducer'
import { standardConfig } from './exampleConfigs'
import { getUniqueClientId } from '../../src/utilities'

describe('CREATE actions', () => {
  const createReducer = apiReducer(standardConfig)
  let createReducerState = {}


  it('should create a new member and assign it a cId', () => {
    const cId = getUniqueClientId()

    createReducerState = createReducer(createReducerState, {
      type: 'Posts.ASSIGN_CID', cId
    })

    expect(createReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {
              cId,
              loading: false,
              loadingError: undefined,
              attributes: {}
            }
          ]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should set the attributes of the member in the collection on success of CREATE call', () => {
    const response = {
      id: 4135,
      title: 'Three weird tricks for testing Redux Rails',
      body: '1: use Jest. 2: profit. 3: maybe this should only be 2 weird tricks...'
    }

    const cId = getUniqueClientId()

    createReducerState = createReducer({}, {
      type: 'Posts.ASSIGN_CID', cId
    })

    createReducerState = createReducer(createReducerState, {
      type: 'Posts.CREATE_SUCCESS',
      cId,
      id: response.id,
      response
    })

    expect(createReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {
              cId,
              id: response.id,
              loading: false,
              loadingError: undefined,
              attributes: response
            }
          ]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should set the loading error of the member in the collection on CREATE_ERROR', () => {
    const cId = getUniqueClientId()

    createReducerState = createReducer({}, {
      type: 'Posts.ASSIGN_CID', cId
    })

    createReducerState = createReducer(createReducerState, {
      type: 'Posts.CREATE_ERROR',
      cId,
      error: {
        message: 'This did not go well'
      }
    })

    expect(createReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {
              cId,
              loading: false,
              loadingError: {
                message: 'This did not go well',
              },
              attributes: {}
            }
          ]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should create a singular resource, assign it a cId and set its attributes after successful CREATE call', () => {
    const singularConfig = {
      resources: { User: { controller: 'user' } }
    }
    const singleResourceReducer = apiReducer(singularConfig)
    const cId = getUniqueClientId()
    const response = {
      id: 4135,
      title: 'Why you should probably never do this',
      body: 'Creating a singular resource from the client? Alright...'
    }
    let singularReducerState

    singularReducerState = singleResourceReducer(singularReducerState, {
      type: 'User.ASSIGN_CID', cId
    })

    singularReducerState = singleResourceReducer(singularReducerState, {
      type: 'User.CREATE_SUCCESS',
      cId,
      id: response.id,
      response
    })

    expect(singularReducerState).toEqual(
      {
        User: {
          cId,
          id: response.id,
          loading: false,
          loadingError: undefined,
          attributes: response
        }
      }
    )
  })

  it('should assign the singular resoucrce a cId and set its error after failed CREATE call', () => {
    const singularConfig = {
      resources: { User: { controller: 'user' } }
    }
    const singleResourceReducer = apiReducer(singularConfig)
    const cId = getUniqueClientId()
    const response = {
      id: 4135,
      title: 'Why you should probably never do this',
      body: 'Creating a singular resource from the client? Alright...'
    }
    let singularReducerState

    singularReducerState = singleResourceReducer(singularReducerState, {
      type: 'User.ASSIGN_CID', cId
    })

    singularReducerState = singleResourceReducer(singularReducerState, {
      type: 'User.CREATE_ERROR',
      cId,
      error: {
        message: 'This was a bad idea anyway'
      }
    })

    expect(singularReducerState).toEqual(
      {
        User: {
          cId,
          loading: false,
          loadingError: {
            message: 'This was a bad idea anyway'
          },
          attributes: {}
        }
      }
    )
  })

  describe('CREATE actions with custom idAttribute', () => {
    const customIdConfig = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts',
          idAttribute: '@@_id_'
        }
      }
    }
    const createReducer = apiReducer(customIdConfig)
    let createReducerState = {}

    it('should set the attributes of the member in the collection on success of CREATE call with custom id attribute', () => {
      const response = {
        '@@_id_': 4135,
        title: 'Three weird tricks for testing Redux Rails',
        body: '1: use Jest. 2: profit. 3: maybe this should only be 2 weird tricks...'
      }

      const cId = getUniqueClientId()

      createReducerState = createReducer({}, {
        type: 'Posts.ASSIGN_CID', cId
      })

      createReducerState = createReducer(createReducerState, {
        type: 'Posts.CREATE_SUCCESS',
        cId,
        id: response['@@_id_'],
        response
      })

      expect(createReducerState).toEqual(
        {
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {
                cId,
                id: response['@@_id_'],
                loading: false,
                loadingError: undefined,
                attributes: response
              }
            ]
          }
        }
      )
    })
  })

  it('should assign the singular resource a cId', () => {
    const singularReducer = apiReducer({
      resources: { User: { controller: 'user ' } }
    })
    const cId = getUniqueClientId()
    let singularReducerState

    singularReducerState = singularReducer(singularReducerState, {
      type: 'User.ASSIGN_CID', cId
    })

    expect(singularReducerState).toEqual(
      {
        User: {
          loading: false,
          loadingError: undefined,
          cId,
          attributes: {}
        }
      }
    )
  })

})
