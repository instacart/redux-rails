import apiReducer from '../../src/apiReducer'
import railsActions from '../../src/railsActions'

describe('DESTROY actions', () => {
  const destroyConfig = {
    baseUrl: 'http://localhost:3000/',
    resources: {
      Posts: {
        controller: 'posts',
        models: [
          {id: 4, foo: 'bar4'},
          {id: 5, foo: 'bar5'},
          {id: 6, foo: 'bar6'}
        ]
      },
      User: {
        controller: 'user',
        attributes: {
          id: 4135,
          first_name: 'Dom',
          last_name: 'Cocchiarella',
          description: 'Human living on Earth'
        }
      }
    }
  }
  const destroyReducer = apiReducer(destroyConfig)
  let destroyReducerState = {}

  it('shoud set the loading state of the member within the collection', () => {
    destroyReducerState = destroyReducer(destroyReducerState, railsActions.destroy({
      resource: 'Posts',
      id: 4
    }))
    expect(destroyReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: true, loadingError: undefined, id: 4, attributes: {id: 4, foo: 'bar4'}},
            {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
          ]
        },
        User: {
          id: 4135,
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

  it('shoud set the loading error state of the member within the collection', () => {
    destroyReducerState = destroyReducer(destroyReducerState, {
      type: 'Posts.DESTROY_ERROR',
      id: 4,
      error: {
        message: 'I\'m Sorry, Redux Rails. I\'m afraid I can\'t do that right now.'
      }
    })
    expect(destroyReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {
              loading: false,
              loadingError: {
                message: 'I\'m Sorry, Redux Rails. I\'m afraid I can\'t do that right now.'
              },
              id: 4,
              attributes: {id: 4, foo: 'bar4'}
            },
            {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
          ]
        },
        User: {
          id: 4135,
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

  it('shoud remove the member from the collection', () => {
    destroyReducerState = destroyReducer(destroyReducerState, {
      type: 'Posts.DESTROY_SUCCESS',
      id: 4
    })
    expect(destroyReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
          ]
        },
        User: {
          id: 4135,
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

  it('shoud set the loading state of the singular resource', () => {
    destroyReducerState = destroyReducer(destroyReducerState, railsActions.destroy({
      resource: 'User'
    }))
    expect(destroyReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
          ]
        },
        User: {
          id: 4135,
          loading: true,
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

  it('shoud set the loading error state of the singular resource', () => {
    destroyReducerState = destroyReducer(destroyReducerState, {
      type: 'User.DESTROY_ERROR',
      error: {
        message: 'I\'m Sorry, Redux Rails. I\'m afraid I can\'t do that right now.'
      }
    })
    expect(destroyReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
          ]
        },
        User: {
          id: 4135,
          loading: false,
          loadingError: {
            message: 'I\'m Sorry, Redux Rails. I\'m afraid I can\'t do that right now.'
          },
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

  it('shoud remove the singluar resource on successful DESTROY call', () => {
    destroyReducerState = destroyReducer(destroyReducerState, {
      type: 'User.DESTROY_SUCCESS'
    })
    expect(destroyReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
          ]
        },
        User: null
      }
    )
  })


})
