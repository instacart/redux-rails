import { createStore, compose ,applyMiddleware } from 'redux'
import apiReducer from '../src/apiReducer'
import middleWare from '../src/middleWare'
import {
  standardConfig,
  configWithParse,
  configWithBadCollectionParse,
  configWithOptimisticUpdateDisableOnOneResource,
  configWithOptimisticUpdateDisableOnSingularResource,
  configWithOptimisticUpdateDisableOnTopLevel
} from './apiReducer/exampleConfigs'
import nock from 'nock'
require('es6-promise').polyfill();
require('isomorphic-fetch');

const reduxRailsMiddleware = middleWare(standardConfig)
const standardReducer = apiReducer(standardConfig)

const siteApp = createStore(
  apiReducer(standardConfig),
  {},
  compose(applyMiddleware(reduxRailsMiddleware))
);

const createFakeStore = fakeData => ({
  getState() {
    return fakeData
  }
})

const dispatchWithStoreOf = (storeData, action) => {
  let dispatched = null
  const dispatch = reduxRailsMiddleware(siteApp)(actionAttempt => dispatched = actionAttempt)
  dispatch(action)
  return dispatched
}

/* http mocking */

// Index
nock('http://localhost:3000')
  .persist()
  .get('/posts?q=How%20to%20test&categories[]=1,categories[]=2,categories[]=3')
  .reply(200, [
    {id: 123, title: 'How to test'},
    {id: 124, title: 'How to test again'},
    {id: 125, title: 'How to test and again'}
  ]);

nock('http://localhost:3000')
  .persist()
  .get('/posts')
  .reply(200, [
    {id: 123, title: 'How to test'},
    {id: 124, title: 'How to test again'},
    {id: 125, title: 'How to test and again'}
  ]);

nock('http://localhost:3000')
  .persist()
  .get('/comments')
  .reply(200, [
    {id: 42, text: 'Hello'},
    {id: 43, text: 'Hi!'},
    {id: 44, text: 'Is that all you really have to say after what you\'ve done?'},
    {id: 45, text: '...I just met you, like, three minutes ago.'}
  ]);

// Show
nock('http://localhost:3000')
  .persist()
  .get('/posts/3')
  .reply(200, {id: 3, title: 'Post #3 is #1 the best!'});

nock('http://localhost:3000')
  .persist()
  .get('/posts/555')
  .reply(200, {id: 555, title: 'Real area code'});

nock('http://localhost:3000')
  .persist()
  .get('/comments/42')
  .reply(200, {id: 42, title: 'This joke again?'});

nock('http://localhost:3000')
  .persist()
  .get('/comments/666')
  .reply(200, 'this is not json');

nock('http://localhost:3000')
  .persist()
  .get('/posts/667')
  .reply(200);

// Create
nock('http://localhost:3000')
  .persist()
  .post('/posts')
  .reply(200, {id: 101, title: 'So many dalmations'});

nock('http://localhost:3000')
  .persist()
  .post('/comments')
  .reply(200, {id: 153, text: 'yo, dawg'});

// Update
nock('http://localhost:3000')
  .persist()
  .put('/posts/125')
  .reply(200, {
    id: 125,
    title: 'Now even closer to 2nd place'
  });

nock('http://localhost:3000')
  .persist()
  .put('/user')
  .reply(200, {
    first_name: 'Maya',
    last_name: 'Angelou',
    title: 'Poet'
  });

// Destroy
nock('http://localhost:3000')
  .persist()
  .delete('/posts/3')
  .reply(200, {});

// Destroy Error
nock('http://localhost:3000')
  .persist()
  .delete('/posts/123')
  .reply(500, { message: 'that was a bad move.'});


/* Tests */

describe('middleWare', () => {
  const waitForAppStateUpdate = () => {
    console.log('waitForAppStateUpdate called')

    return new Promise((resolve, reject) => {
      console.log('waitForAppStateUpdate promise beginning')
      setTimeout(() => {
        console.log('waitForAppStateUpdate resolving')
        resolve(siteApp.getState())
      }, 50)
    })
  }

  it('should save the last used queryParam', () => {
    const action = {
      type: 'Posts.INDEX',
      data: {
        queryParams: {
          q: 'How to test',
          categories: [1, 2, 3]
        }
      }
    }
    let appState = siteApp.getState()

    expect(dispatchWithStoreOf({}, action)).toEqual(action)

    siteApp.dispatch(action)
    appState = siteApp.getState()

    expect(appState).toEqual({
      Posts: {
        loading: true,
        loadingError: undefined,
        models: [],
        queryParams: {
          q: 'How to test',
          categories: [1, 2, 3]
        }
      },
      User: {
        "loading": false,
        "loadingError": undefined,
        "attributes": {}
      }
    })
  })

  it('should send along action', () => {
    const action = {
      type: 'Posts.INDEX'
    }
    let appState = siteApp.getState()

    expect(dispatchWithStoreOf({}, action)).toEqual(action)

    siteApp.dispatch(action)
    appState = siteApp.getState()

    expect(appState).toEqual({
      Posts: {
        loading: true,
        loadingError: undefined,
        models: []
      },
      User: {
        "loading": false,
        "loadingError": undefined,
        "attributes": {}
      }
    })
  })

  it('Successful index call should update app state with returned models', () => {
    return waitForAppStateUpdate()
      .then((appState) => {
        console.log('Successful index call should update app state with returned models reached assertion!')
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 123, loading: false, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
              {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
              {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'How to test and again'}}
            ]
          },
          User: {
            "loading": false,
            "loadingError": undefined,
            "attributes": {}
          }
        })
      })
  })

  it('show call should update app state with loading and returned model on success', () => {
    const action = {
      type: 'Posts.SHOW',
      data: { id: 3 }
    }
    expect(dispatchWithStoreOf({}, action)).toEqual(action)

    siteApp.dispatch(action)

    expect(siteApp.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: [
          {id: 123, loading: false, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
          {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
          {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'How to test and again'}},
          {id: 3, loading: true, loadingError: undefined, attributes: {}},
        ]
      },
      User: {
        "loading": false,
        "loadingError": undefined,
        "attributes": {}
      }
    })

    return waitForAppStateUpdate()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 123, loading: false, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
              {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
              {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'How to test and again'}},
              {id: 3, loading: false, loadingError: undefined, attributes: {id: 3, title: 'Post #3 is #1 the best!'}},
            ]
          },
          User: {
            "loading": false,
            "loadingError": undefined,
            "attributes": {}
          }
        })
      })
  })

  it('create call should update app state with loading and returned model on success', () => {
    const action = {
      type: 'Posts.CREATE',
      data: {
        title: 'So many dalmations'
      }
    }
    expect(dispatchWithStoreOf({}, action)).toEqual(action)

    expect(siteApp.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: [
          {id: 123, loading: false, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
          {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
          {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'How to test and again'}},
          {id: 3, loading: false, loadingError: undefined, attributes: {id: 3, title: 'Post #3 is #1 the best!'}},
          {cId: 1, loading: true, loadingError: undefined, attributes: { title: 'So many dalmations' }, __prevData: {}}
        ]
      },
      User: {
        "loading": false,
        "loadingError": undefined,
        "attributes": {}
      }
    })

    return waitForAppStateUpdate()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 123, loading: false, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
              {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
              {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'How to test and again'}},
              {id: 3, loading: false, loadingError: undefined, attributes: {id: 3, title: 'Post #3 is #1 the best!'}},
              {id: 101, cId: 1, loading: false, loadingError: undefined, attributes: {id: 101, title: 'So many dalmations'}}
            ]
          },
          User: {
            "loading": false,
            "loadingError": undefined,
            "attributes": {}
          }
        })
      })
  })

  it('update call should update app state with loading and returned model on success', () => {
    const action = {
      type: 'Posts.UPDATE',
      data: {
        id: 125,
        title: 'Now even closer to 2nd place'
      }
    }

    siteApp.dispatch(action)

    expect(siteApp.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: [
          {id: 123, loading: false, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
          {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
          {id: 125, loading: true, loadingError: undefined, attributes: {id: 125, title: 'Now even closer to 2nd place'}},
          {id: 3, loading: false, loadingError: undefined, attributes: {id: 3, title: 'Post #3 is #1 the best!'}},
          {id: 101, cId: 1, loading: false, loadingError: undefined, attributes: {id: 101, title: 'So many dalmations'}}
        ]
      },
      User: {
        "loading": false,
        "loadingError": undefined,
        "attributes": {}
      }
    })

    return waitForAppStateUpdate()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 123, loading: false, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
              {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
              {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'Now even closer to 2nd place'}},
              {id: 3, loading: false, loadingError: undefined, attributes: {id: 3, title: 'Post #3 is #1 the best!'}},
              {id: 101, cId: 1, loading: false, loadingError: undefined, attributes: {id: 101, title: 'So many dalmations'}}
            ]
          },
          User: {
            "loading": false,
            "loadingError": undefined,
            "attributes": {}
          }
        })
      })
  })

  it('destory call should update app state with loading and returned model on success', () => {
    const action = {
      type: 'Posts.DESTROY',
      data: { id: 3 }
    }

    siteApp.dispatch(action)

    expect(siteApp.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: [
          {id: 123, loading: false, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
          {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
          {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'Now even closer to 2nd place'}},
          {id: 3, loading: true, loadingError: undefined, attributes: {id: 3, title: 'Post #3 is #1 the best!'}},
          {id: 101, cId: 1, loading: false, loadingError: undefined, attributes: {id: 101, title: 'So many dalmations'}}
        ]
      },
      User: {
        "loading": false,
        "loadingError": undefined,
        "attributes": {}
      }
    })

    return waitForAppStateUpdate()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 123, loading: false, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
              {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
              {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'Now even closer to 2nd place'}},
              {id: 101, cId: 1, loading: false, loadingError: undefined, attributes: {id: 101, title: 'So many dalmations'}}
            ]
          },
          User: {
            "loading": false,
            "loadingError": undefined,
            "attributes": {}
          }
        })
      })
  })

  it('call should update app state with error and on bad call', () => {
    const action = {
      type: 'Posts.DESTROY',
      data: { id: 123 }
    }

    siteApp.dispatch(action)

    expect(siteApp.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: [
          {id: 123, loading: true, loadingError: undefined, attributes: {id: 123, title: 'How to test'}},
          {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
          {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'Now even closer to 2nd place'}},
          {id: 101, cId: 1, loading: false, loadingError: undefined, attributes: {id: 101, title: 'So many dalmations'}}
        ]
      },
      User: {
        "loading": false,
        "loadingError": undefined,
        "attributes": {}
      }
    })

    return waitForAppStateUpdate()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 123, loading: false, loadingError: { message: 'Internal Server Error' }, attributes: {id: 123, title: 'How to test'}},
              {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
              {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'Now even closer to 2nd place'}},
              {id: 101, cId: 1, loading: false, loadingError: undefined, attributes: {id: 101, title: 'So many dalmations'}}
            ]
          },
          User: {
            "loading": false,
            "loadingError": undefined,
            "attributes": {}
          }
        })
      })
  })

  it('call should update app state with error and on bad response format', () => {
    const action = {
      type: 'Posts.SHOW',
      data: { id: 667 }
    }

    siteApp.dispatch(action)

    expect(siteApp.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: [
          {id: 123, loading: false, loadingError: {message: "Internal Server Error"}, attributes: {id: 123, title: 'How to test'}},
          {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
          {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'Now even closer to 2nd place'}},
          {id: 101, cId: 1, loading: false, loadingError: undefined, attributes: {id: 101, title: 'So many dalmations'}},
          {id: 667, loading: true, loadingError: undefined, attributes: {}}
        ]
      },
      User: {
        "loading": false,
        "loadingError": undefined,
        "attributes": {}
      }
    })

    return waitForAppStateUpdate()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 123, loading: false, loadingError: { message: 'Internal Server Error' }, attributes: {id: 123, title: 'How to test'}},
              {id: 124, loading: false, loadingError: undefined, attributes: {id: 124, title: 'How to test again'}},
              {id: 125, loading: false, loadingError: undefined, attributes: {id: 125, title: 'Now even closer to 2nd place'}},
              {id: 101, cId: 1, loading: false, loadingError: undefined, attributes: {id: 101, title: 'So many dalmations'}},
              {id: 667, loading: false, loadingError: 'SyntaxError: Unexpected end of JSON input', attributes: {}}
            ]
          },
          User: {
            "loading": false,
            "loadingError": undefined,
            "attributes": {}
          }
        })
      })
  })

  it('call should update app state with correctly using parse method', () => {
    const reduxRailsMiddlewareParse = middleWare(configWithParse)
    const parseReducer = apiReducer(configWithParse)

    const siteAppParse = createStore(
      apiReducer(configWithParse),
      {},
      compose(applyMiddleware(reduxRailsMiddlewareParse))
    )

    const waitForAppStateUpdateParse = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(siteAppParse.getState())
        }, 10)
      })
    }

    const action = {
      type: 'Posts.SHOW',
      data: { id: 555 }
    }

    siteAppParse.dispatch(action)

    expect(siteAppParse.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: [{
          attributes: {},
          id: 555,
          loading: true,
          loadingError: undefined
        }]
      },
      Comments: {
        loading: false,
        loadingError: undefined,
        models: []
      }
    })

    return waitForAppStateUpdateParse()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 555, loading: false, loadingError: undefined, attributes: {data: {id: 555, title: 'Real area code'}}}
            ]
          },
          Comments: {
            loading: false,
            loadingError: undefined,
            models: []
          }
        })
      })
  })

  it('call should update app state with correctly using parse methods for member', () => {
    const reduxRailsMiddlewareParses = middleWare(configWithBadCollectionParse)
    const parsesReducer = apiReducer(configWithBadCollectionParse)

    const siteAppParses = createStore(
      apiReducer(configWithBadCollectionParse),
      {},
      compose(applyMiddleware(reduxRailsMiddlewareParses))
    )

    const waitForAppStateUpdateParses = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(siteAppParses.getState())
        }, 10)
      })
    }

    const action = {
      type: 'Comments.SHOW',
      data: { id: 42 }
    }

    siteAppParses.dispatch(action)

    expect(siteAppParses.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: []
      },
      Comments: {
        loading: false,
        loadingError: undefined,
        models: [{
          attributes: {},
          id: 42,
          loading: true,
          loadingError: undefined
        }]
      }
    })

    return waitForAppStateUpdateParses()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: []
          },
          Comments: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 42, loading: false, loadingError: undefined, attributes: {collectionData: {id: 42, title: 'This joke again?'}}}
            ]
          }
        })
      })
  })

  it('call with bad array response shoud set error state', () => {
    const reduxRailsMiddlewareBadParse = middleWare(configWithBadCollectionParse)
    const parsesReducer = apiReducer(configWithBadCollectionParse)

    const siteAppBadParses = createStore(
      apiReducer(configWithBadCollectionParse),
      {},
      compose(applyMiddleware(reduxRailsMiddlewareBadParse))
    )

    const waitForAppStateUpdateParses = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(siteAppBadParses.getState())
        }, 10)
      })
    }

    const action = {
      type: 'Comments.INDEX'
    }

    siteAppBadParses.dispatch(action)

    expect(siteAppBadParses.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: []
      },
      Comments: {
        loading: true,
        loadingError: undefined,
        models: []
      }
    })

    return waitForAppStateUpdateParses()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: []
          },
          Comments: {
            loading: false,
            loadingError: 'Bad data received from server. INDEX calls expect an array.',
            models: []
          }
        })
      })
  })

  it('call should update app state with correctly using parse methods for collection', () => {
    const reduxRailsMiddlewareParses = middleWare(configWithParse)

    const siteAppParses = createStore(
      apiReducer(configWithParse),
      {},
      compose(applyMiddleware(reduxRailsMiddlewareParses))
    )

    const waitForAppStateUpdateParses = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(siteAppParses.getState())
        }, 10)
      })
    }

    const action = {
      type: 'Comments.INDEX'
    }

    siteAppParses.dispatch(action)

    expect(siteAppParses.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: []
      },
      Comments: {
        loading: true,
        loadingError: undefined,
        models: []
      }
    })

    return waitForAppStateUpdateParses()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: []
          },
          Comments: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 42, loading: false, loadingError: undefined, attributes: { id: 42, text: 'Hello', extraData: 'extra'}},
              {id: 43, loading: false, loadingError: undefined, attributes: { id: 43, text: 'Hi!', extraData: 'extra'}},
              {id: 44, loading: false, loadingError: undefined, attributes: { id: 44, text: 'Is that all you really have to say after what you\'ve done?', extraData: 'extra'}},
              {id: 45, loading: false, loadingError: undefined, attributes: { id: 45, text: '...I just met you, like, three minutes ago.', extraData: 'extra'}}
            ]
          }
        })
      })
  })

  it('should set not set __prevData with optimistic updates disabled for resource', () => {
    const reduxRailsMiddlewareNotOptimistic = middleWare(configWithOptimisticUpdateDisableOnOneResource)

    const siteAppNotOptimistic = createStore(
      apiReducer(configWithOptimisticUpdateDisableOnOneResource),
      {},
      compose(applyMiddleware(reduxRailsMiddlewareNotOptimistic))
    )

    const waitForAppStateUpdateNotOptimistic = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(siteAppNotOptimistic.getState())
        }, 10)
      })
    }

    const action = {
      type: 'Comments.CREATE',
      data: {
        text: 'This is going to work'
      }
    }

    siteAppNotOptimistic.dispatch(action)

    expect(siteAppNotOptimistic.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: []
      },
      Comments: {
        loading: false,
        loadingError: undefined,
        models: [{
          cId: 2,
          loading: true,
          loadingError: undefined,
          attributes: {},
          __prevData: undefined
        }]
      }
    })

    return waitForAppStateUpdateNotOptimistic()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: []
          },
          Comments: {
            loading: false,
            loadingError: undefined,
            models: [
              {id: 153, cId: 2, loading: false, loadingError: undefined, attributes: { id: 153, text: 'yo, dawg' }}
            ]
          }
        })
      })
  })

  it('should set not set __prevData with optimistic updates disabled for singular resource', () => {
    const reduxRailsMiddlewareNotOptimisticSingluar = middleWare(configWithOptimisticUpdateDisableOnSingularResource)

    const siteAppNotOptimisticSingular = createStore(
      apiReducer(configWithOptimisticUpdateDisableOnSingularResource),
      {},
      compose(applyMiddleware(reduxRailsMiddlewareNotOptimisticSingluar))
    )

    const waitForAppStateUpdateNotOptimisticSingular = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(siteAppNotOptimisticSingular.getState())
        }, 10)
      })
    }

    const action = {
      type: 'User.UPDATE',
      data: {
        first_name: 'Maya',
        last_name: 'Angelou',
        title: 'Poet'
      }
    }

    siteAppNotOptimisticSingular.dispatch(action)

    expect(siteAppNotOptimisticSingular.getState()).toEqual({
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
    })

    return waitForAppStateUpdateNotOptimisticSingular()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: []
          },
          User: {
            loading: false,
            loadingError: undefined,
            attributes: {
              first_name: 'Maya',
              last_name: 'Angelou',
              title: 'Poet'
            }
          }
        })
      })
  })

  it('should set not set __prevData with optimistic updates disabled for on top level of config', () => {
    const reduxRailsMiddlewareNotOptimisticTop = middleWare(configWithOptimisticUpdateDisableOnTopLevel)

    const siteAppNotOptimisticTop = createStore(
      apiReducer(configWithOptimisticUpdateDisableOnTopLevel),
      {},
      compose(applyMiddleware(reduxRailsMiddlewareNotOptimisticTop))
    )

    const waitForAppStateUpdateNotOptimisticTop = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(siteAppNotOptimisticTop.getState())
        }, 10)
      })
    }

    const action = {
      type: 'User.UPDATE',
      data: {
        first_name: 'Maya',
        last_name: 'Angelou',
        title: 'Poet'
      }
    }

    siteAppNotOptimisticTop.dispatch(action)

    expect(siteAppNotOptimisticTop.getState()).toEqual({
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
    })

    return waitForAppStateUpdateNotOptimisticTop()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: []
          },
          User: {
            loading: false,
            loadingError: undefined,
            attributes: {
              first_name: 'Maya',
              last_name: 'Angelou',
              title: 'Poet'
            }
          }
        })
      })

    siteAppNotOptimisticTop.dispatch({
      type: 'Posts.CREATE',
      data: {
        title: 'So many dalmations'
      }
    })

    expect(siteAppNotOptimisticTop.getState()).toEqual({
      Posts: {
        loading: false,
        loadingError: undefined,
        models: [{
          cId: 3,
          loading: true,
          loadingError: undefined,
          attributes: {}
        }]
      },
      User: {
        loading: true,
        loadingError: undefined,
        attributes: {
          first_name: 'Maya',
          last_name: 'Angelou',
          title: 'Poet'
        }
      }
    })

    return waitForAppStateUpdateNotOptimisticTop()
      .then((appState) => {
        expect(appState).toEqual({
          Posts: {
            loading: false,
            loadingError: undefined,
            models: [
              {
                cId: 3,
                id: 101,
                loading: true,
                loadingError: undefined,
                attributes: {id: 101, title: 'So many dalmations'}
              }
            ]
          },
          User: {
            loading: false,
            loadingError: undefined,
            attributes: {
              first_name: 'Maya',
              last_name: 'Angelou',
              title: 'Poet'
            }
          }
        })
      })


  })
})
