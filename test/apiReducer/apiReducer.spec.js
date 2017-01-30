import { standardConfig, configWithModelsReady } from './exampleConfigs'
import { apiReducer, railsActions } from 'redux-rails'

describe('apiReducer', () => {

  const standardReducer = apiReducer(standardConfig)

  it('should return correct intial state', () => {
    expect(
      standardReducer(undefined, {})
    ).toEqual(
      {
        Posts: {
          loading: false,
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

  it('should return correct intial state with models', () => {
    const modelsReducer = apiReducer(configWithModelsReady)

    expect(
      modelsReducer(undefined, {})
    ).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: false, loadingError: undefined, id: 4, attributes: {id: 4, foo: 'bar4'}},
            {loading: false, loadingError: undefined, id: 5, attributes: {id: 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {id: 6, foo: 'bar6'}}
          ]
        }
      }
    )
  })

  it('should return correct intial state with models and custom id', () => {
    const modelsWithcustomIdConfig = {
      domain: 'http://localhost:3000/',
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

    const modelsWithCustomIdReducer = apiReducer(modelsWithcustomIdConfig)

    expect(
      modelsWithCustomIdReducer(undefined, {})
    ).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [
            {loading: false, loadingError: undefined, id: 4, attributes: {'_@@aid': 4, foo: 'bar4'}},
            {loading: false, loadingError: undefined, id: 5, attributes: {'_@@aid': 5, foo: 'bar5'}},
            {loading: false, loadingError: undefined, id: 6, attributes: {'_@@aid': 6, foo: 'bar6'}}
          ]
        }
      }
    )
  })
})
