import apiReducer from '../../src/apiReducer'
import { standardConfig, configWithModelsReady } from './exampleConfigs'

describe('LOADING action', () => {
  const loadingReducer = apiReducer(configWithModelsReady)
  let loadingReducerState = {}

  it('shoud set the loading state of the member in the collection by id', () => {
    loadingReducerState = loadingReducer(loadingReducerState, {
      type: 'Posts.SET_LOADING',
      id: 4
    })
    expect(loadingReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: true, loadingError: undefined, id: 4, attributes: {id: 4, foo: 'bar4'}},
            {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
          ]
        }
      }
    )
  })

  it('shoud set the loading state of the member in the collection by cId', () => {
    const cId = 12
    loadingReducerState = loadingReducer(loadingReducerState, {
      type: 'Posts.ASSIGN_CID',
      cId
    })
    loadingReducerState = loadingReducer(loadingReducerState, {
      type: 'Posts.SET_LOADING',
      cId
    })
    expect(loadingReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: true, loadingError: undefined, id: 4, attributes: {id: 4, foo: 'bar4'}},
            {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}},
            {loading: true, loadingError: undefined, cId, attributes: {}}
          ]
        }
      }
    )
  })

  it('shoud set the loading state of the member in the collection by id with custom idAttribute', () => {
    const modelsWithcustomIdConfig = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Posts: {
          idAttribute: '_@@aid',
          controller: 'posts',
          models: [
            {'_@@aid': 4, foo: 'bar4'},
            {'_@@aid': 5, foo: 'bar5'},
            {'_@@aid': 6, foo: 'bar6'}
          ]
        }
      }
    }

    const loadingCustomIdReducer = apiReducer(modelsWithcustomIdConfig)
    let loadingCustomIdReducerState = {}

    loadingCustomIdReducerState = loadingCustomIdReducer(loadingCustomIdReducerState, {
      type: 'Posts.SET_LOADING',
      id: 5
    })
    expect(loadingCustomIdReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: false, loadingError: undefined, id: 4, attributes: {'_@@aid': 4, foo: 'bar4'}},
            {loading: true, loadingError: undefined, id: 5, attributes: {'_@@aid': 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {'_@@aid': 6, foo: 'bar6'}},
          ]
        }
      }
    )

  })

  it('shoud set the loading state of the singular resource', () => {
    const singleResourceReducer = apiReducer(standardConfig)
    let singleResourceReducerState = {}

    singleResourceReducerState = singleResourceReducer(singleResourceReducerState, {
      type: 'User.SET_LOADING'
    })
    expect(singleResourceReducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: []
        },
        User: {
          loading: true,
          loadingError: undefined,
          attributes: {}
        }
      }
    )

  })
})
