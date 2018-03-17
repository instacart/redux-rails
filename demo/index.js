import { compose, combineReducers, createStore, applyMiddleware } from 'redux'
import { middleWare, apiReducer, railsActions, combineConfigs } from 'redux-rails'

const counterReducerStartingState = {
  value: 0
}

const counterReducer = (state = counterReducerStartingState, action) => {
  switch(action.type) {
    case 'increment': {
      return Object.assign({}, state, {
        value: state.value + 1
      })
    }
    case 'decrement': {
      return Object.assign({}, state, {
        value: state.value - 1
      })
    }
    default: {
      return state
    }
  }
}

// const apiConfig = {
//   baseUrl: 'http://localhost:3000/v3/',
//   resources: {
//     Users: {
//       controller: 'addresses', // knows to do addresses/${idAttribute}
//       parse: {
//         collection: resp => resp.users,
//         memeber: resp => resp.user
//       },
//       idAttribute: '_id' // defaults to 'id'
//     },
//     Retailers: {
//       controller: 'retailers',
//       parse: {
//         collection: resp => resp.retailers,
//         memeber: resp => resp.retailers
//       },
//       idAttribute: 'id' // defaults to 'id'
//     },
//     Posts: {
//       controller: 'posts'
//     }
//     PaymentMethods: {
//       controller: 'payment_methods',
//       baseUrl: 'https://api.instacart.com/v2/' // can override baseUrl per resource
//     }
//   },
//   fetchParams: {
//
//   }
// }

const apiConfig = {
  baseUrl: 'http://localhost:3000/',
  resources: {
    Posts: {
      controller: 'posts'
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

const defaultConfig = {
  baseUrl: 'http://localhost:3000/',
  fetchParams: {
    headers: {
      'content-type':'application/json'
    }
  }
}

const commentsConfig = {
  resources: {
    Comments: {
      controller: 'comments',
      idAttribute: '__$id',
      models: [
        {'__$id': 1, val: 121},
        {'__$id': 2, val: 122},
        {'__$id': 3, val: 123}
      ]
    }
  }
}

const photosConfig = {
  resources: {
    Photos: {
      controller: 'photos'
    }
  }
}

const resourcesConfig = combineConfigs(
  defaultConfig,
  commentsConfig,
  photosConfig
)

const reduxRailsConfig = combineConfigs(
  defaultConfig,
  apiConfig,
  commentsConfig,
  photosConfig
)


// redux store
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const siteApp = window.siteApp = createStore(
  combineReducers({
    counter: counterReducer,
    models: apiReducer(apiConfig),
    resources: apiReducer(resourcesConfig)
  }),
  {},
  composeEnhancers(
    applyMiddleware(middleWare(reduxRailsConfig)),
  )
);

window.setTimeout(() => {
  console.log('starting state', siteApp.getState())

  siteApp.dispatch({
    type: 'increment'
  })
  siteApp.dispatch({
    type: 'increment'
  })
  // siteApp.dispatch({
  //   type: 'Posts.SHOW',
  //   data: {id: 3}
  // })

  siteApp.dispatch(railsActions.show({
    resource: 'Posts',
    id: 3
  }))

  siteApp.dispatch(railsActions.show({
    resource: 'Posts',
    id: 5,
    controller: 'foo_posts'
  }))

  siteApp.dispatch(railsActions.show({
    resource: 'Comments',
    id: 15
  }))

  siteApp.dispatch(railsActions.index({resource: 'Photos'}))
    .then(resp => { 
      console.log('async photos: ', resp) 
    })
    .catch(err => {
      console.log('error' , err)
    })

  // siteApp.dispatch({
  //   type: 'User.SHOW'
  // })

  siteApp.dispatch(railsActions.show({
    resource: 'User'
  }))

  siteApp.dispatch({
    type: 'Posts.CREATE',
    data: {
      title: 'foo',
      body: 'bar',
      userId: Math.floor(Math.random() * 100)
    }
  })

  siteApp.dispatch({
    type: 'Posts.UPDATE',
    data: {
      id: 3,
      title: 'foo',
      body: 'bar',
      userId: Math.floor(Math.random() * 100)
    }
  })

  window.setTimeout(() => {
    siteApp.dispatch({
      type: 'User.UPDATE',
      data: {
        description: 'A pretty ok human living on Earth.'
      }
    })

    siteApp.dispatch({
      type: 'User.UPDATE',
      data: {
        description: 'A pretty ok human living on Earth.'
      }
    })

    siteApp.dispatch({
      type: 'Posts.DESTROY',
      data: { id: 3 }
    })

    window.setTimeout(() => {
      siteApp.dispatch({ type: 'User.DESTROY' })
    }, 2000)
  }, 5000)
  // siteApp.dispatch(railsActions.show({
  //   resource: 'retailers',
  //   data: {
  //     id: 234
  //   }
  // }))

  console.log('ending state', siteApp.getState())
}, 1000)
