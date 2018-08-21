import { standardConfig, standardFuncConfig, configWithCustomReducer, configWithModelsReady } from './exampleConfigs'
import apiReducer from '../../src/apiReducer'

describe('apiReducer', () => {

  const standardReducer = apiReducer(standardConfig)
  const standardFuncConfigReducer = apiReducer(standardFuncConfig)
  const customReducer = apiReducer(configWithCustomReducer)


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

  it('should return correct intial state with function config', () => {
    expect(
      standardFuncConfigReducer(undefined, {})
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

  it('should return correct intial state when using custom reducer', () => {
    expect(
      customReducer(undefined, {})
    ).toEqual(
      {
        Comments: {
          loading: false,
          loadingError: undefined,
          models: []
        }
      }
    )
  })

  it('should return correct state when using action for custom reducer', () => {
    expect(
      customReducer(undefined, {
        type: 'Comments.CUSTOM_ACTION'
      })
    ).toEqual(
      {
        Comments: {
          loading: false,
          loadingError: undefined,
          models: [],
          customAttribute: 'CUSTOM ACTION WUZ HERE'
        }
      }
    )
  })
})
