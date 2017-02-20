import { apiReducer, railsActions } from 'redux-rails'
import { standardConfig } from './exampleConfigs'

describe('SET_OPTIMISTIC_DATA', () => {
  const reducer = apiReducer(standardConfig)
  let reducerState = {
    Posts: {
      loading: false,
      loadingError: undefined,
      models: [{
        cId: 44,
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

  it('should set __prevData for a new model with cId', () => {
    reducerState = reducer(reducerState, {
      type: 'Posts.SET_OPTIMISTIC_DATA',
      data: {
        title: 'The curious story of Dominic Dunder',
        body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
      },
      cId: 44
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            loading: true,
            loadingError: undefined,
            attributes: {
              title: 'The curious story of Dominic Dunder',
              body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
            },
            __prevData: {}
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

  it('should unset __prevData for a new model with cId', () => {
    reducerState = reducer(reducerState, {
      type: 'Posts.UNSET_OPTIMISTIC_DATA',
      cId: 44
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            loading: false,
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

  it('should set __prevData for a new model with cId, then optimistically update the model with an id', () => {
    reducerState = reducer(reducerState, {
      type: 'Posts.SET_OPTIMISTIC_DATA',
      cId: 44,
      data: {
        title: 'The curious story of Dominic Dunder',
        body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
      }
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            loading: false,
            loadingError: undefined,
            attributes: {
              title: 'The curious story of Dominic Dunder',
              body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
            },
            __prevData: {}
          }]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
        }
      }
    )

    reducerState = reducer(reducerState, {
      type: 'Posts.CREATE_SUCCESS',
      cId: 44,
      id: 123,
      response: {
        id: 123,
        title: 'The curious story of Dominic Dunder',
        body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
      }
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            id: 123,
            loading: false,
            loadingError: undefined,
            attributes: {
              id: 123,
              title: 'The curious story of Dominic Dunder',
              body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
            }
          }]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {}
        }
      }
    )

    reducerState = reducer(reducerState, {
      type: 'Posts.SET_OPTIMISTIC_DATA',
      id: 123,
      data: {
        title: '123 was spiteful.',
        body: 'So spiteful'
      }
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            id: 123,
            loading: false,
            loadingError: undefined,
            __prevData: {
              id: 123,
              title: 'The curious story of Dominic Dunder',
              body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
            },
            attributes: {
              title: '123 was spiteful.',
              body: 'So spiteful'
            }
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

  it('should unset current attributes and replace them with __prevData. __prevData should be reset', () => {
    reducerState = reducer(reducerState, {
      type: 'Posts.UNSET_OPTIMISTIC_DATA',
      id: 123
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            id: 123,
            loading: false,
            loadingError: undefined,
            __prevData: undefined,
            attributes: {
              id: 123,
              title: 'The curious story of Dominic Dunder',
              body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
            }
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

  it('should set current __prevData correctly for singular model', () => {
    reducerState = reducer(reducerState, {
      type: 'User.SET_OPTIMISTIC_DATA',
      data: {
        first_name: 'Dom',
        last_name: 'Cocchia',
        title: 'Prefect'
      }
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            id: 123,
            loading: false,
            loadingError: undefined,
            __prevData: undefined,
            attributes: {
              id: 123,
              title: 'The curious story of Dominic Dunder',
              body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
            }
          }]
        },
        User: {
          loading: false,
          loadingError: undefined,
          __prevData: {},
          attributes: {
            first_name: 'Dom',
            last_name: 'Cocchia',
            title: 'Prefect'
          }
        }
      }
    )

    reducerState = reducer(reducerState, {
      type: 'User.UPDATE_SUCCESS',
      response: {
        first_name: 'Dom',
        last_name: 'Cocchia',
        title: 'Prefect'
      }
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            id: 123,
            loading: false,
            loadingError: undefined,
            __prevData: undefined,
            attributes: {
              id: 123,
              title: 'The curious story of Dominic Dunder',
              body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
            }
          }]
        },
        User: {
          loading: false,
          loadingError: undefined,
          __prevData: undefined,
          attributes: {
            first_name: 'Dom',
            last_name: 'Cocchia',
            title: 'Prefect'
          }
        }
      }
    )
  })

  it('should unset current __prevData correctly for singular model', () => {
    reducerState = reducer(reducerState, {
      type: 'User.SET_OPTIMISTIC_DATA',
      data: {
        first_name: 'TotallyA',
        last_name: 'Person',
        title: 'Human'
      }
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            id: 123,
            loading: false,
            loadingError: undefined,
            __prevData: undefined,
            attributes: {
              id: 123,
              title: 'The curious story of Dominic Dunder',
              body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
            }
          }]
        },
        User: {
          loading: false,
          loadingError: undefined,
          __prevData: {
            first_name: 'Dom',
            last_name: 'Cocchia',
            title: 'Prefect'
          },
          attributes: {
            first_name: 'TotallyA',
            last_name: 'Person',
            title: 'Human'
          }
        }
      }
    )

    reducerState = reducer(reducerState, {
      type: 'User.UNSET_OPTIMISTIC_DATA'
    })

    expect(reducerState).toEqual(
      {
        Posts: {
          loading: false,
          loadingError: undefined,
          models: [{
            cId: 44,
            id: 123,
            loading: false,
            loadingError: undefined,
            __prevData: undefined,
            attributes: {
              id: 123,
              title: 'The curious story of Dominic Dunder',
              body: 'It was the best of times, it was the last time I saw him. Call me Dominic.'
            }
          }]
        },
        User: {
          loading: false,
          loadingError: undefined,
          attributes: {
            first_name: 'Dom',
            last_name: 'Cocchia',
            title: 'Prefect'
          },
          __prevData: undefined
        }
      }
    )
  })
})
