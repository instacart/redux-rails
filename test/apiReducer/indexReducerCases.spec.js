import apiReducer from '../../src/apiReducer'
import railsActions from '../../src/railsActions'
import { standardConfig, configWithMetaDataSetting } from './exampleConfigs'

describe('INDEX actions', () => {
  const indexReducer = apiReducer(standardConfig)
  const indexReducerWithPaginate = apiReducer(configWithMetaDataSetting)
  let indexReducerState = {}
  const baseModelState = {
    loading: false,
    loadingError: undefined,
  }
  const baseCollectionState = {
    ...baseModelState,
    models: []
  }
  const baseExpectedState = {
    Posts: baseCollectionState,
    User: { ...baseModelState, attributes: {} }
  }

  const expectedPostsState = (newState) => ({
    ...baseExpectedState,
    Posts: {
      ...baseCollectionState,
      ...newState
    }
  })

  const baseCatsExpectedState = {
    Cats: baseCollectionState,
  }

  const expectedCatsState = (newState) => ({
    ...baseCatsExpectedState,
    Cats: {
      ...baseCollectionState,
      ...newState
    }
  })

  it('should set queryParams on the collection', () => {
    const queryParams = { foo: 'bar' }
    indexReducerState = indexReducer(indexReducerState, railsActions.index({
      resource: 'Posts',
      queryParams
    }))

    expect(indexReducerState).toEqual(expectedPostsState({
      loading: true,
      queryParams
    }))
  })

  it('should set a loading state on the collection', () => {
    indexReducerState = indexReducer(indexReducerState, railsActions.index({
      resource: 'Posts',
    }))

    expect(indexReducerState).toEqual(expectedPostsState({
      loading: true
    }))
  })


  it('should set a loading error state on the collection', () => {
    indexReducerState = indexReducer(indexReducerState, {
      type: 'Posts.INDEX_ERROR',
      error: { message: 'a bad thing happened' }
    })

    expect(indexReducerState).toEqual(expectedPostsState({
      loadingError: { message: 'a bad thing happened'}
    }))
  })

  it('should reset error and loading state on next INDEX call', () => {
    indexReducerState = indexReducer(indexReducerState, {
      type: 'Posts.INDEX'
    })

    expect(indexReducerState).toEqual(expectedPostsState({
      loading: true
    }))
  })

  it('should set loading and collection state on success of INDEX call', () => {
    indexReducerState = indexReducer(indexReducerState, {
      type: 'Posts.INDEX_SUCCESS',
      response: [{id: 1, foo: 'bar1'}, {id: 2, foo: 'bar2'}, {id: 3, foo: 'bar3'}]
    })

    expect(indexReducerState).toEqual(expectedPostsState({
      models: [
        {loading: false, loadingError: undefined, id: 1, attributes: {id: 1, foo: 'bar1'}},
        {loading: false, loadingError: undefined, id: 2, attributes: {id: 2, foo: 'bar2'}},
        {loading: false, loadingError: undefined, id: 3, attributes: {id: 3, foo: 'bar3'}}
      ]
    }))
  })

  it('should replace collection state on success of subsequent INDEX call', () => {
    indexReducerState = indexReducer(indexReducerState, {
      type: 'Posts.INDEX_SUCCESS',
      response: [{id: 4, foo: 'bar4'}, {id: 5, foo: 'bar5'}, {id: 6, foo: 'bar6'}]
    })

    expect(indexReducerState).toEqual(expectedPostsState({
      models: [
        {loading: false, loadingError: undefined, id: 4, attributes: {id: 4, foo: 'bar4'}},
        {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
        {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
      ]
    }))
  })

  it('should correctly look for top level key matching resource name and use as data', () => {
    indexReducerState = indexReducer(indexReducerState, {
      type: 'Posts.INDEX_SUCCESS',
      response: {Posts: [{id: 1, foo: 'bar1'}, {id: 2, foo: 'bar2'}, {id: 3, foo: 'bar3'}]}
    })

    expect(indexReducerState).toEqual(expectedPostsState({
      models: [
        {loading: false, loadingError: undefined, id: 1, attributes: {id: 1, foo: 'bar1'}},
        {loading: false, loadingError: undefined, id: 2, attributes: {id: 2, foo: 'bar2'}},
        {loading: false, loadingError: undefined, id: 3, attributes: {id: 3, foo: 'bar3'}}
      ]
    }))
  })

  it('should correctly look for top level key matching lower case resource name and use as data', () => {
    indexReducerState = indexReducer(indexReducerState, {
      type: 'Posts.INDEX_SUCCESS',
      response: {posts: [{id: 8, foo: 'bar8'}, {id: 9, foo: 'bar9'}, {id: 10, foo: 'bar10'}]}
    })

    expect(indexReducerState).toEqual(expectedPostsState({
      models: [
        {loading: false, loadingError: undefined, id: 8, attributes: {id: 8, foo: 'bar8'}},
        {loading: false, loadingError: undefined, id: 9, attributes: {id: 9, foo: 'bar9'}},
        {loading: false, loadingError: undefined, id: 10, attributes: {id: 10, foo: 'bar10'}}
      ]
    }))
  })

  describe('pagination', () => {
    it('should work correctly when there are no overrides', () => {
      indexReducerState = indexReducerWithPaginate(indexReducerState, {
        type: 'Cats.INDEX_SUCCESS',
        response: {Cats: [{id: 1, foo: 'bar1'}, {id: 2, foo: 'bar2'}, {id: 3, foo: 'bar3'}]}
      })
      indexReducerState = indexReducerWithPaginate(indexReducerState, {
        type: 'Cats.INDEX_SUCCESS',
        response: {Cats: [{id: 4, foo: 'bar4'}, {id: 5, foo: 'bar5'}, {id: 6, foo: 'bar6'}]}
      })

      expect(indexReducerState).toEqual(expectedCatsState({
        models: [
          {loading: false, loadingError: undefined, id: 1, attributes: {id: 1, foo: 'bar1'}},
          {loading: false, loadingError: undefined, id: 2, attributes: {id: 2, foo: 'bar2'}},
          {loading: false, loadingError: undefined, id: 3, attributes: {id: 3, foo: 'bar3'}},
          {loading: false, loadingError: undefined, id: 4, attributes: {id: 4, foo: 'bar4'}},
          {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
          {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}},
        ]
      }))
    })

    it('should keep overridden data in the same order', () => {
      indexReducerState = indexReducerWithPaginate({}, {
        type: 'Cats.INDEX_SUCCESS',
        response: {Cats: [{id: 1, foo: 'bar1'}, {id: 2, foo: 'bar2'}, {id: 3, foo: 'bar3'}]}
      })
      indexReducerState = indexReducerWithPaginate(indexReducerState, {
        type: 'Cats.INDEX_SUCCESS',
        response: {Cats: [{id: 4, foo: 'bar4'}, {id: 5, foo: 'bar5'}, {id: 6, foo: 'bar6'}]}
      })
      indexReducerState = indexReducerWithPaginate(indexReducerState, {
        type: 'Cats.INDEX_SUCCESS',
        response: {Cats: [{id: 7, foo: 'bar7'}, {id: 2, foo: 'changedBar2'}, {id: 8, foo: 'bar8'}]}
      })

      expect(indexReducerState).toEqual(expectedCatsState({
        models: [
          {loading: false, loadingError: undefined, id: 1, attributes: {id: 1, foo: 'bar1'}},
          {loading: false, loadingError: undefined, id: 2, attributes: {id: 2, foo: 'changedBar2'}},
          {loading: false, loadingError: undefined, id: 3, attributes: {id: 3, foo: 'bar3'}},
          {loading: false, loadingError: undefined, id: 4, attributes: {id: 4, foo: 'bar4'}},
          {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
          {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}},
          {loading: false, loadingError: undefined, id: 7, attributes: {id: 7, foo: 'bar7'}},
          {loading: false, loadingError: undefined, id: 8, attributes: {id: 8, foo: 'bar8'}},
        ]
      }))
    })

    it(`should keep not re-arrange data that's passed in a different order than originally`, () => {
      indexReducerState = indexReducerWithPaginate({}, {
        type: 'Cats.INDEX_SUCCESS',
        response: {Cats: [{id: 1, foo: 'bar1'}, {id: 2, foo: 'bar2'}, {id: 3, foo: 'bar3'}]}
      })
      indexReducerState = indexReducerWithPaginate(indexReducerState, {
        type: 'Cats.INDEX_SUCCESS',
        response: {Cats: [{id: 2, foo: 'changedbar2'}, {id: 1, foo: 'changedbar1'}, {id: 3, foo: 'changedbar3'}]}
      })
      indexReducerState = indexReducerWithPaginate(indexReducerState, {
        type: 'Cats.INDEX_SUCCESS',
        response: {Cats: [{id: 5, foo: 'bar5'}]}
      })
      
      expect(indexReducerState).toEqual(expectedCatsState({
        models: [
          {loading: false, loadingError: undefined, id: 1, attributes: {id: 1, foo: 'changedbar1'}},
          {loading: false, loadingError: undefined, id: 2, attributes: {id: 2, foo: 'changedbar2'}},
          {loading: false, loadingError: undefined, id: 3, attributes: {id: 3, foo: 'changedbar3'}},
          {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
        ]
      }))
    })
  })
})
