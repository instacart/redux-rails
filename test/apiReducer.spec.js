import { apiReducer, railsActions } from 'redux-rails'
import { getUniqueClientId } from '../src/utilities'

const standardConfig = {
  domain: 'http://localhost:3000/',
  resources: {
    Posts: {
      controller: 'posts',
      resp: (resp) => {
        return {
          metaFoo: 'metaBar',
          response: resp
        }
      }
    },
    User: {
      controller: 'user'
    }
  },
  fetchParams: {
    headers: {
      'content-type':'application/json'
    }
  }
}

const commentsConfig = {
  resources: {
    Comments: {
      controller: 'comments'
    }
  }
}

describe('apiReducer', () => {

  const standardReducer = apiReducer(standardConfig)

  it('should return correct intial state', () => {
    expect(
      standardReducer(undefined, {})
    ).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined
        },
        User: {
          loading: false,
          loadingError: undefined
        }
      }
    )
  })

  describe('INDEX actions', () => {
    const indexReducer = apiReducer(standardConfig)
    let indexReducerState = {}

    it('should set a loading state on the collection', () => {
      indexReducerState = indexReducer(indexReducerState, railsActions.index({ resource: 'Posts' }))

      expect(indexReducerState).toEqual(
        {
          Posts: {
            loading: true,
            loadingError: undefined
          },
          User: {
            loading: false,
            loadingError: undefined
          }
        }
      )
    })

    it('should set a loading error state on the collection', () => {
      indexReducerState = indexReducer(indexReducerState, {
        type: 'Posts.INDEX_ERROR',
        error: { message: 'a bad thing happened' }
      })

      expect(indexReducerState).toEqual(
        {
          Posts: {
            loading: false,
            loadingError: { message: 'a bad thing happened'}
          },
          User: {
            loading: false,
            loadingError: undefined
          }
        }
      )
    })

    it('should reset error and loading state on next INDEX call', () => {
      indexReducerState = indexReducer(indexReducerState, {
        type: 'Posts.INDEX'
      })

      expect(indexReducerState).toEqual(
        {
          Posts: {
            loading: true,
            loadingError: undefined
          },
          User: {
            loading: false,
            loadingError: undefined
          }
        }
      )
    })

    it('should set loading and collection state on success of INDEX call', () => {
      indexReducerState = indexReducer(indexReducerState, {
        type: 'Posts.INDEX_SUCCESS',
        response: [{id: 1, foo: 'bar1'}, {id: 2, foo: 'bar2'}, {id: 3, foo: 'bar3'}]
      })

      expect(indexReducerState).toEqual(
        {
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {loading: false, loadingError: undefined, id: 1, attributes: {id: 1, foo: 'bar1'}},
              {loading: false, loadingError: undefined, id: 2, attributes: {id: 2, foo: 'bar2'}},
              {loading: false, loadingError: undefined, id: 3, attributes: {id: 3, foo: 'bar3'}}]
          },
          User: {
            loading: false,
            loadingError: undefined
          }
        }
      )
    })

    it('should replace collection state on success of subsequent INDEX call', () => {
      indexReducerState = indexReducer(indexReducerState, {
        type: 'Posts.INDEX_SUCCESS',
        response: [{id: 4, foo: 'bar4'}, {id: 5, foo: 'bar5'}, {id: 6, foo: 'bar6'}]
      })
      expect(indexReducerState).toEqual(
        {
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {loading: false, loadingError: undefined, id: 4, attributes: {id: 4, foo: 'bar4'}},
              {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
              {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}]
          },
          User: {
            loading: false,
            loadingError: undefined
          }
        }
      )
    })

  })

  describe('SHOW actions', () => {
    const showReducer = apiReducer(standardConfig)
    let showReducerState = {}

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
              loadingError: undefined
            }]
          },
          User: {
            loading: false,
            loadingError: undefined
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
              loadingError: undefined
            }]
          },
          User: {
            loading: true,
            loadingError: undefined
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
              }
            }]
          },
          User: {
            loading: true,
            loadingError: undefined
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
              loadingError: undefined
            }]
          },
          User: {
            loading: true,
            loadingError: undefined
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
              loadingError: undefined
            }]
          },
          User: {
            loading: false,
            loadingError: {
              message: 'uh oh, this is probably a bad thing,'
            }
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
              loadingError: undefined
            }]
          },
          User: {
            loading: true,
            loadingError: undefined
          }
        }
      )
    })

    it('should set the member attributes within a collection after successful SHOW call', () => {
      showReducerState = showReducer(showReducerState, {
        type: 'Posts.SHOW_SUCCESS',
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
            loadingError: undefined
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

    describe('SHOW actions with custom idAttribute', () => {
      const customIdConfig = {
        domain: 'http://localhost:3000/',
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
                '@@_id_': 4135,
                loading: true,
                loadingError: undefined
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
          response
        })

        expect(customIdReducerState).toEqual(
          {
            Posts: {
              loading: false,
              loadingError: undefined,
              models: [{
                '@@_id_': 4135,
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
                '@@_id_': 4135,
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
  })

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
                loadingError: undefined
              }
            ]
          },
          User: {
            loading: false,
            loadingError: undefined
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
            loadingError: undefined
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
                  message: 'This did not go well'
                }
              }
            ]
          },
          User: {
            loading: false,
            loadingError: undefined
          }
        }
      )
    })

    describe('CREATE actions with custom idAttribute', () => {
      const customIdConfig = {
        domain: 'http://localhost:3000/',
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
                  '@@_id_': response['@@_id_'],
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

  })
})
