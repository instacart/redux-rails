import apiReducer from '../../src/apiReducer'
import railsActions from '../../src/railsActions'
import { standardConfig, configWithNestedModelAction } from './exampleConfigs'

describe('SHOW actions', () => {
  const showReducer = apiReducer(standardConfig)
  let showReducerState = {}
  let queryParams = { foo: 'bar' }


  it('should create member and set queryParams on the member within a collection', () => {
    showReducerState = showReducer(showReducerState, railsActions.show({
      resource: 'Posts',
      id: 123,
      queryParams
    }))
    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: true,
            loadingError: undefined,
            attributes: {},
            queryParams
          }]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should create member and set a loading state on the member within a collection', () => {
    showReducerState = showReducer(showReducerState, railsActions.show({
      resource: 'Posts',
      id: 123
    }))
    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: true,
            loadingError: undefined,
            attributes: {}
          }]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should set the queryParams on the singlar resource', () => {
    showReducerState = showReducer(showReducerState, railsActions.show({
      resource: 'User',
      queryParams
    }))

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: true,
            loadingError: undefined,
            attributes: {}
          }]
        },
        User: {
          loading: true,
          loadingError: undefined,
          attributes: {},
          queryParams
        }
      }
    )
  })

  it('should set a loading state on the singlar resource', () => {
    showReducerState = showReducer(showReducerState, railsActions.show({
      resource: 'User'
    }))

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: true,
            loadingError: undefined,
            attributes: {}
          }]
        },
        User: {
          loading: true,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should set the loadingerror on the member within a collection on SHOW_ERROR', () => {
    showReducerState = showReducer(showReducerState, {
      type: 'Posts.SHOW_ERROR',
      id: 123,
      error: {
        message: 'uh oh, this is probably a bad thing,'
      }
    })

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: false,
            loadingError: {
              message: 'uh oh, this is probably a bad thing,'
            },
            attributes: {}
          }]
        },
        User: {
          loading: true,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should clear the loadingerror on the member within a collection on subsequent SHOW call', () => {
    showReducerState = showReducer(showReducerState, railsActions.show({
      resource: 'Posts',
      id: 123
    }))

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: true,
            loadingError: undefined,
            attributes: {}
          }]
        },
        User: {
          loading: true,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should set the loadingerror on the singular resource on SHOW_ERROR', () => {
    showReducerState = showReducer(showReducerState, {
      type: 'User.SHOW_ERROR',
      error: {
        message: 'uh oh, this is probably a bad thing,'
      }
    })

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: true,
            loadingError: undefined,
            attributes: {}
          }]
        },
        User: {
          loading: false,
          loadingError: {
            message: 'uh oh, this is probably a bad thing,'
          },
          attributes: {}
        }
      }
    )
  })

  it('should clear the loadingerror on the singular resource on subsequent SHOW call', () => {
    showReducerState = showReducer(showReducerState, railsActions.show({
      resource: 'User'
    }))

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: true,
            loadingError: undefined,
            attributes: {}
          }]
        },
        User: {
          loading: true,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should set the member attributes within a collection after successful SHOW call', () => {
    showReducerState = showReducer(showReducerState, {
      type: 'Posts.SHOW_SUCCESS',
      id: 123,
      response: {
        id: 123,
        title: 'Three weird tricks for testing Redux Rails',
        body: '1: use Jest. 2: profit. 3: maybe this should only be 2 weird tricks...'
      }
    })

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: false,
            loadingError: undefined,
            attributes: {
              id: 123,
              title: 'Three weird tricks for testing Redux Rails',
              body: '1: use Jest. 2: profit. 3: maybe this should only be 2 weird tricks...'
            }
          }]
        },
        User: {
          loading: true,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should set the attributes on a singular resource after successful SHOW call', () => {
    const response = {
      id: 4135,
      first_name: 'Dom',
      last_name: 'Cocchiarella',
      description: 'Human living on Earth'
    }

    showReducerState = showReducer(showReducerState, {
      type: 'User.SHOW_SUCCESS',
      response
    })

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            id: 123,
            loading: false,
            loadingError: undefined,
            attributes: {
              id: 123,
              title: 'Three weird tricks for testing Redux Rails',
              body: '1: use Jest. 2: profit. 3: maybe this should only be 2 weird tricks...'
            }
          }]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: response
        }
      }
    )
  })

  it('should create new resource on successful SHOW call of unknown resource', () => {
    const response = {
      id: 153131,
      title: 'How to take over the world',
      body: 'The same way we always do'
    }

    showReducerState = showReducer(showReducerState, {
      type: 'Posts.SHOW_SUCCESS',
      id: response.id,
      response
    })

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {
              id: 123,
              loading: false,
              loadingError: undefined,
              attributes: {
                id: 123,
                title: 'Three weird tricks for testing Redux Rails',
                body: '1: use Jest. 2: profit. 3: maybe this should only be 2 weird tricks...'
              }
            },
            {
              id: 153131,
              loading: false,
              loadingError: undefined,
              attributes: response
            }
          ]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {
            id: 4135,
            first_name: 'Dom',
            last_name: 'Cocchiarella',
            description: 'Human living on Earth'
          }
        }
      }
    )
  })

  it('should create new resource on SHOW_ERROR for unknown resource', () => {
    showReducerState = showReducer(showReducerState, {
      type: 'Posts.SHOW_ERROR',
      id: 163161,
      error: {
        message: 'Well, back to the drawing board'
      }
    })

    expect(showReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {
              id: 123,
              loading: false,
              loadingError: undefined,
              attributes: {
                id: 123,
                title: 'Three weird tricks for testing Redux Rails',
                body: '1: use Jest. 2: profit. 3: maybe this should only be 2 weird tricks...'
              }
            },
            {
              id: 153131,
              loading: false,
              loadingError: undefined,
              attributes: {
                id: 153131,
                title: 'How to take over the world',
                body: 'The same way we always do'
              }
            },
            {
              id: 163161,
              loading: false,
              loadingError: {
                message: 'Well, back to the drawing board'
              },
              attributes: {}
            }
          ]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {
            id: 4135,
            first_name: 'Dom',
            last_name: 'Cocchiarella',
            description: 'Human living on Earth'
          }
        }
      }
    )
  })

  describe('SHOW actions with custom idAttribute', () => {
    const customIdConfig = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts',
          idAttribute: '@@_id_'
        }
      }
    }

    const customIdReducer = apiReducer(customIdConfig)
    let customIdReducerState = {}

    it('should create the member and set the loading state on the member after SHOW action', () => {
      customIdReducerState = customIdReducer(customIdReducerState, railsActions.show({
        resource: 'Posts',
        id: 4135
      }))

      expect(customIdReducerState).toEqual(
        {
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [{
              id: 4135,
              loading: true,
              loadingError: undefined,
              attributes: {}
            }]
          }
        }
      )
    })

    it('should set the attributes and the loading state on the member after succesful SHOW call', () => {
      const response = {
        '@@_id_': 4135,
        title: 'Three weird tricks for testing Redux Rails',
        body: '1: use Jest. 2: profit. 3: maybe this should only be 2 weird tricks...'
      }
      customIdReducerState = customIdReducer(customIdReducerState, {
        type: 'Posts.SHOW_SUCCESS',
        id: 4135,
        response
      })

      expect(customIdReducerState).toEqual(
        {
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [{
              id: 4135,
              loading: false,
              loadingError: undefined,
              attributes: response
            }]
          }
        }
      )
    })

    it('should set the loadingerror on the the member on SHOW_ERROR', () => {
      const response = {
        '@@_id_': 4135,
        title: 'Three weird tricks for testing Redux Rails',
        body: '1: use Jest. 2: profit. 3: maybe this should only be 2 weird tricks...'
      }

      customIdReducerState = customIdReducer(customIdReducerState, {
        type: 'Posts.SHOW_ERROR',
        id: 4135,
        error: {
          message: 'uh oh, this is probably a bad thing,'
        }
      })

      expect(customIdReducerState).toEqual(
        {
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [{
              id: 4135,
              loading: false,
              loadingError: {
                message: 'uh oh, this is probably a bad thing,'
              },
              attributes: response
            }]
          }
        }
      )
    })

  })
  describe('nested actions', () => {
    const nestedShowReducer = apiReducer(configWithNestedModelAction)
    let nestedShowReducerState = {}

    nestedShowReducerState = nestedShowReducer(nestedShowReducerState, railsActions.show({
      resource: 'DogFriend'
    }))

    it('should initialize state', () => {
      expect(nestedShowReducerState).toEqual({
        DogFriend: {
          loading: true,
          loadingError: undefined,
          attributes: {}
        }
      })
    })

    it('should set the attributes on a singular resource after successful SHOW call', () => {
      const response = {
        id: 5,
        importantFriends: {
          firstFriend: 'buddy',
          onlyFriend: 'Tooty'
        }
      }

      nestedShowReducerState = nestedShowReducer(nestedShowReducerState, {
        type: 'DogFriend.SHOW_SUCCESS',
        id: response.id,
        response
      })

      expect(nestedShowReducerState).toEqual({
        DogFriend: {
          loading: false,
          loadingError: undefined,
          __prevData: undefined,
          attributes: response,
          id: response.id
        }
      })
    })
  })
})
