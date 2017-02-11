import { apiReducer, railsActions } from 'redux-rails'
import { standardConfig } from './exampleConfigs'

describe('INDEX actions', () => {
  const indexReducer = apiReducer(standardConfig)
  let indexReducerState = {}

  it('should set a loading state on the collection', () => {
    indexReducerState = indexReducer(indexReducerState, railsActions.index({ resource: 'Posts' }))

    expect(indexReducerState).toEqual(
      {
        Posts: {
          loading: true,
          loadingError: undefined,
          models: []
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
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
          loadingError: { message: 'a bad thing happened'},
          models: []
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
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
          loadingError: undefined,
          models: []
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
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
          loadingError: undefined,
          attributes: {}
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
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
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

  it('should correctly look for top level key matching resource name and use as data', () => {
    indexReducerState = indexReducer(indexReducerState, {
      type: 'Posts.INDEX_SUCCESS',
      response: {Posts: [{id: 1, foo: 'bar1'}, {id: 2, foo: 'bar2'}, {id: 3, foo: 'bar3'}]}
    })
    expect(indexReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: false, loadingError: undefined, id: 1, attributes: {id: 1, foo: 'bar1'}},
            {loading: false, loadingError: undefined, id: 2, attributes: {id: 2, foo: 'bar2'}},
            {loading: false, loadingError: undefined, id: 3, attributes: {id: 3, foo: 'bar3'}}
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

  it('should correctly look for top level key matching lower case resource name and use as data', () => {
    indexReducerState = indexReducer(indexReducerState, {
      type: 'Posts.INDEX_SUCCESS',
      response: {posts: [{id: 8, foo: 'bar8'}, {id: 9, foo: 'bar9'}, {id: 10, foo: 'bar10'}]}
    })
    expect(indexReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: false, loadingError: undefined, id: 8, attributes: {id: 8, foo: 'bar8'}},
            {loading: false, loadingError: undefined, id: 9, attributes: {id: 9, foo: 'bar9'}},
            {loading: false, loadingError: undefined, id: 10, attributes: {id: 10, foo: 'bar10'}}
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

})
