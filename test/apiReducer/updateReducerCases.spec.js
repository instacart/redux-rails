import apiReducer from '../../src/apiReducer'
import railsActions from '../../src/railsActions'
import { configWithModelsReady } from './exampleConfigs'

describe('UPDATE actions', () => {
  const updateReducer = apiReducer(configWithModelsReady)
  const singularReducer = apiReducer({
    resources: { User: { controller: 'user ' } }
  })
  let updateReducerState
  let singularReducerState

  it('should set the loading state on the member within a collection', () => {
    updateReducerState = updateReducer(updateReducerState, railsActions.update({
      resource: 'Posts',
      id: 4,
      attributes: {
        foo: 'test'
      }
    }))
    expect(updateReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {id: 4, loading: true, loadingError: undefined, attributes: { id: 4, foo: 'bar4'}},
            {id: 5, loading: false, loadingError: undefined, attributes: { id: 5, foo: 'bar5'}},
            {id: 6, loading: false, loadingError: undefined, attributes: { id: 6, foo: 'bar6'}}
          ]
        }
      }
    )
  })

  it('should set the loading error state on the member within a collection', () => {
    updateReducerState = updateReducer(updateReducerState, {
      type: 'Posts.UPDATE_ERROR',
      id: 4,
      error: {
        message: 'resist!'
      }
    })
    expect(updateReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {
              id: 4,
              loading: false,
              loadingError: {
                message: 'resist!'
              },
              attributes: { id: 4, foo: 'bar4'}
            },
            {id: 5, loading: false, loadingError: undefined, attributes: { id: 5, foo: 'bar5'}},
            {id: 6, loading: false, loadingError: undefined, attributes: { id: 6, foo: 'bar6'}}
          ]
        }
      }
    )
  })

  it('should update the attributes of the member within a collection on success of UPDATE call', () => {
    updateReducerState = updateReducer(updateReducerState, {
      type: 'Posts.UPDATE_SUCCESS',
      id: 4,
      response: {
        id: 4,
        foo: 'test'
      }
    })
    expect(updateReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {
              id: 4,
              loading: false,
              loadingError: undefined,
              attributes: { id: 4, foo: 'test'}
            },
            {id: 5, loading: false, loadingError: undefined, attributes: { id: 5, foo: 'bar5'}},
            {id: 6, loading: false, loadingError: undefined, attributes: { id: 6, foo: 'bar6'}}
          ]
        }
      }
    )
  })

  it('should update the attributes of an unknown member within a collection on success of UPDATE call', () => {
    updateReducerState = updateReducer(updateReducerState, {
      type: 'Posts.UPDATE_SUCCESS',
      id: 13513,
      response: {
        id: 13513,
        foo: 'uh oh'
      }
    })
    expect(updateReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {
              id: 4,
              loading: false,
              loadingError: undefined,
              attributes: { id: 4, foo: 'test'}
            },
            {id: 5, loading: false, loadingError: undefined, attributes: { id: 5, foo: 'bar5'}},
            {id: 6, loading: false, loadingError: undefined, attributes: { id: 6, foo: 'bar6'}},
            {id: 13513, loading: false, loadingError: undefined, attributes: { id: 13513, foo: 'uh oh'}}
          ]
        }
      }
    )
  })

  it('should set the loading state on a singular resource', () => {
    singularReducerState = singularReducer(singularReducerState, railsActions.update({
      resource: 'User',
      attributes: {
        foo: 'test'
      }
    }))
    expect(singularReducerState).toEqual(
      {
        User: {
          loading: true,
          loadingError: undefined,
          attributes: {}
        }
      }
    )
  })

  it('should set the error loading state on a singular resource', () => {
    singularReducerState = singularReducer(singularReducerState, {
      type: 'User.UPDATE_ERROR',
      error: {
        message: '*sad trombone noise*'
      }
    })
    expect(singularReducerState).toEqual(
      {
        User: {
          loading: false,
          loadingError: {
            message: '*sad trombone noise*'
          },
          attributes: {}
        }
      }
    )
  })

  it('should update the attributes on a singular resource after successful UPDATE call', () => {
    singularReducerState = singularReducer(singularReducerState, {
      type: 'User.UPDATE_SUCCESS',
      response: {
        first_name: 'Boyencé',
        last_name: 'Knowles',
        description: 'Queen'
      }
    })
    expect(singularReducerState).toEqual(
      {
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {
            first_name: 'Boyencé',
            last_name: 'Knowles',
            description: 'Queen'
          }
        }
      }
    )
  })
})
