Redux Rails
=========================
<strong>Redux and your server talking without fuss.</strong>

[![CircleCI](https://circleci.com/gh/instacart/redux-rails.svg?style=shield&circle-token=dfe00f3d2f89c4b810250f6d18b384df3ab1bc6b)](https://circleci.com/gh/instacart/redux-rails)

Redux Rails is a Redux middleware for auto-generating the actions, reducers and settings for talking to your RESTful backend. It removes boilerplate and keeps your app consistent.

## Features
- Simple, pre-defined Redux actions
- Automated loading state, including loading errors
- Promise based actions without additional thunk middleware
- Optionally disabled, optimistic updates
- Optional response parsing
- Sane defaults, highly customizable
- Auto-generated, extendable reducers for each resource
- And more!

## How is it done?
> 1. Create your config
> 2. Create your Redux store
> 3. Use provided actions to talk with your backend api
> 4. Access your api results in your Redux state

You create a config object that lays out your backend resources. The config roughly matches a Rails routes file, but **a Rails backend is not a requirement**. You then hand this config to the Redux Rails middleware and assign your config to a reducer creator. Redux Rails then gives you specific actions for fetching, updating, creating and deleting these resources. You also get handy metadata related to the resources' loading states. It also keeps an internal queue to ensure methods are executed in order, per resource.


## Basic Usage

```js
// Import necessary tools

import { createStore, applyMiddleware, compose } from 'redux'
import { middleWare, apiReducer, railsActions } from 'redux-rails'

// Set up your config

const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    Posts: {
      controller: 'posts'
    },
    User: {
      controller: 'user'
    }
  }
}

// Create your Redux store

const App = createStore(
  {
    resources: apiReducer(apiConfig) // auto-generates reducers
  },
  {},
  compose(
    applyMiddleware(middleWare(apiConfig))
  )
)

// Fetch your resources

App.dispatch(railsActions.show({
  resource: 'Posts',
  id: 3
}))

App.dispatch(railsActions.show({resource: 'User'}))

// ...wait for server response

// Use your fetched resources

App.getState().resources.Posts.models.map(m => console.log(m))
console.log(App.getState().resources.User)

// OR - use the returned promise to wait for call to server to complete
App.dispatch(railsActions.show({resource: 'User'}))
  .then(repsonse => {
    console.log(response)
  })

```

## Available Rails Actions

### index

Fetch list of members from a resource collection.
```js
App.dispatch(railsActions.index({
  resource: 'Posts',
  queryParams: {
    q: 'React best practices',
    page: 2
  }
}))
```

HTTP GET on resources. Example: `GET http://my-site/myapi/posts`


### show

Fetch a specific member from a resource collection
```js
App.dispatch(railsActions.show({
  resource: 'Posts',
  id: 3
}))
```
HTTP GET on specific member in resources. Example: `GET http://my-site/myapi/posts/3`

### update

Update a specific member of a resource collection
```js
App.dispatch(railsActions.update({
  resource: 'Posts',
  id: 3,
  attributes: {
    title: 'foo',
    body: 'bar'
  }
}))
```

HTTP PUT on specific member in resources. Example: `PUT http://my-site/myapi/posts/3`

### create

Create a new member in a resource collection
```js
App.dispatch(railsActions.create({
  resource: 'Posts',
  attributes: {
    title: 'foo',
    body: 'bar'
  }
}))
```

HTTP POST on resources. Example: `POST http://my-site/myapi/posts`

### destroy

Destroy a specific member inside a resource collection
```js
App.dispatch(railsActions.destroy({
  resource: 'Posts',
  id: 3
}))
```

HTTP DELETE on specific member in resources. Example: `DELETE http://my-site/myapi/posts/3`

### HTTP Method to Redux Actions Mappings


| Redux Rails action | HTTP Method  |
| -----------------  | -----------  |
| index              | GET          |
| show               | GET          |
| create             | POST         |
| update             | PUT          |
| destroy            | DELETE       |

### Singular vs Plural Resources
A resource can be singluar (user) or plural (users). This is determined by the name of the controller for your resource.

```js
const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    User: {
      controller: 'user' // singluar
    },
    Users: {
      controller: 'users' // plural
    },
    Comment: {
      controller: 'comments' // plural
    },
    Cats: {
      controller: 'cat' // singular
    }
  }
}
```

Singular resources do not use or require an id in the actions, nor is an id added to the constructed url.

```js
  App.dispatch(railsActions.show({resource: 'user'}))
  // GET https://your-site-url.com/api/user
```

With the exception of `create`, plural resources require a member id, and the id is added to the constructed url.

```js
  App.dispatch(railsActions.show({resource: 'users', id: 123}))
  // GET https://your-site-url.com/api/users/123
```

With user(s) as an example resource, and `https://your-site-url.com/api/` as your baseUrl, your url structures would look like this for different rails actions.

| Resource Controller | Redux Rails action | HTTP Method  | controller URL |
| ------------------- | ------------------ | -----------  | -------------- |
| user                | index              | GET          | `https://your-site-url.com/api/user`
| users               | index              | GET          | `https://your-site-url.com/api/users`
| user                | show               | GET          | `https://your-site-url.com/api/user`
| users               | show               | GET          | `https://your-site-url.com/api/users/<memberId>`
| user                | create             | POST         | `https://your-site-url.com/api/user`
| users               | create             | POST         | `https://your-site-url.com/api/users`
| user                | update             | PUT          | `https://your-site-url.com/api/user`
| users               | update             | PUT          | `https://your-site-url.com/api/users/<memberId>`
| user                | destroy            | DELETE       | `https://your-site-url.com/api/user`
| users               | destroy            | DELETE       | `https://your-site-url.com/api/users/<memberId>`


## Structure of Redux models and collections
Your backend resources, like users, comments, posts, etc, are put into `models` and `collections`. Which are just objects and arrays, respectively. Collections and models both have metadata (loading state, id, etc). Models have an attributes object, which is set to the response from the server for that model.

```js
  Posts: {
    loading: false,
    loaingError: undefined,
    models: [
      {
        loading: false,
        loaingError: undefined,
        id: 123,
        attributes:{
          id: 123,
          name: 'Dominic'
        }
      },
      {...},
      {...}
    ]
  }
```

**Full exmaple:**

```js
import { createStore, applyMiddleware, compose } from 'redux'
import { middleWare, apiReducer, railsActions } from 'redux-rails'

  const config = {
    baseUrl: 'https://your-site-url.com/api/',
    resources: {
      User: {
        controller: 'user' // singular resource
      },
      Users: {
        controller: 'users' // plural resource
      }
    }
  }

  const App = createStore(
  {
    resources: apiReducer(config)
  },
  {},
  compose(
    applyMiddleware(middleWare(apiConfig))
  )
)
App.dispatch(railsActions.show(resource: 'User')) // fetch user resource
App.dispatch(railsActions.index(resource: 'Users')) // fetch users resource

App.getState()
/*
  After calls finish the redux state would be:
  {
    resources: {
      User: {
        queryParams: {
          verbose: false
        },
        loading: false,
        loadingError: undefined,
        attributes: {
          first_name: 'Leia',
          last_name: 'Organa',
          title: 'General'
        }
      },
      Users: {
      queryParams: {
          q: 'rebels'
        },
        loading: false,
        loadingError: undefined,
        models: [
          {
            loading: false,
            loadingError: undefined,
            id: 123,
            attributes: {
              id: 123,
              first_name: 'Leia',
              last_name: 'Organa',
              title: 'General'
            }
          },
          {
            loading: false,
            loadingError: undefined,
            id: 124,
            attributes: {
              id: 124,
              first_name: 'Han',
              last_name: 'Solo',
              title: 'Smuggler'
            }
          },
          {
            loading: false,
            loadingError: undefined,
            id: 125,
            attributes: {
              id: 125,
              first_name: 'Luke',
              last_name: 'Skywalker',
              title: 'Commander'
            }
          }
        ]
      }
    }
  }
*/

```
### Model
Models are always an object with metadata and an attributes object:
```js
{
  loading: false,
  loadingError: undefined,
  id: 123,
  attributes: {
    id: 123,
    first_name: 'Leia',
    last_name: 'Organa',
    title: 'General'
  }
}
```

### Collection
Collections are an object with metadata and an array of models.
```js
Users: {
  queryParams: {
    q: 'rebels'
  },
  loading: false,
  loadingError: undefined,
  models: [
    {
      loading: false,
      loadingError: undefined,
      id: 123,
      attributes: {
        id: 123,
        first_name: 'Leia',
        last_name: 'Organa',
        title: 'General'
      }
    },
    {
      loading: false,
      loadingError: undefined,
      id: 124,
      attributes: {
        id: 124,
        first_name: 'Han',
        last_name: 'Solo',
        title: 'Smuggler'
      }
    },
    {
      loading: false,
      loadingError: undefined,
      id: 125,
      attributes: {
        id: 125,
        first_name: 'Luke',
        last_name: 'Skywalker',
        title: 'Commander'
      }
    }
  ]
}
```

Singular resources, and models within a collection, can be updated, destroyed, or refetched using `railsActions`.

```js
  App.dispatch(railsActions.update({
    resource: 'Users',
    id: 124,
    attributes: {
      title: 'Captain'
    }
  }))

  /*
  after loading finished, the model would be updated to:
  {
    loading: false,
    loadingError: undefined,
    id: 124,
    attributes: {
      id: 124,
      first_name: 'Han',
      last_name: 'Solo',
      title: 'Captain'
    }
  }
  */

```

### Metadata
Models and collections each get a few pieces of metadata. Some are optional and some are always around.
- **loading** - true while any rails action is currently awaiting a response from the server.
- **loadingError** - any error that occurred during the last rails action. Cleared on subsequent actions.
- **id (optional)** - the id of the model/resource member.
- **cId (optional)** - used for internal purposes only.
- **queryParams** - the query params for the current corresponding model or collection.

You can also add your own arbitray metadata to collections. This is useful for things like paginating a collection. See the `setMetadata` config setting for more info.

## Optimistic Updates
Update and Create actions assume immediate success on the client, by default. If the server returns an error, this data is automatically reverted on the client for you. A loading error will be set on the model. This option can be disabled per config or per resource with the `optimisticUpdateEnabled` attribute.

While an optimistic update is in-flight, previous data is stored in `__prevData`. Using this data directly is not advised, as the structure and permanence of it cannot be guaranteed. Consistently using `attributes` on your models is a far more reliable way to access your data.

## Usage with React-Redux

First, set up your Redux Rails config, set up your apiReducer and apply the Redux Rails middleware

```js
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { railsActions } from 'redux-rails'

class MyReactComponent extends Component {
  static propTypes = {
    fetchPosts: PropTypes.func,
    loading: PropTypes.bool,
    posts: PropTypes.array
  }

  componentWillMount() {
    this.props.fetchPosts()
  }

  render() {
    if (this.props.loading) { return <p>Loading Posts...</p> }

    return (
      <ul>
        {this.props.posts.map(post) => {
          let currentPost = post.attributes
          return (
            <li key={`${post.id`}}>
              <h2>{currentPost.title}</h2>
              <p>{currentPost.body}</p>
            </li>
          )
        }}
      </ul>
    )
  }
}

const mapStateToProps = (state) => ({
  posts: state.resources.Posts.models,
  loading: state.resources.Posts.loading
})

const mapDispatchToProps = {
  fetchPosts: () => { railsActions.index({ resource: 'Posts'}) }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent)
```


## Config in depth
The Redux Rails config has many options. You can also use several configs along with several instances of the apiReducer to distribute your resources throughout your redux store's hierarchy.

A complex example of a Redux Rails config:
```js
const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    Posts: {
      controller: 'posts',
      parse: {
        member: resp => resp.posts,
        collection: (resp) => {
          return {
            foo: 'bar',
            response: resp.posts
          }
        }
      },
      setMetadata: (resp) => {
        const { pagination } = resp
        return { pagination }
      },
      idAttribute: '_id',
      baseUrl: 'https://your-OTHER-site-url.com/api/',
      optimisticUpdateEnabled: false,
      queryParams: {
        deleted: false
      }
    },
    User: {
      controller: 'user',
      disableFetchQueueing: true,
      reducer: (state={}, action) => {
        switch(action.type) {
          case 'User.SOME_CUSTOM_ACTION': {
            return Object.assign({}, state, {
              myPersonalStateChange: 'I can add on to the Redux Rails default reducer!'
            })
          }
          default: {
            return state
          }
        }
      }
    }
  },
  fetchParams: {
    headers: {
      'content-type':'application/json'
    },
    queryParams: {
      foo: 'I am the fallback query string for GET requests!'
    }
  }
}
```

### baseUrl
This is the top level url for all resources in the config. If your site's api is entirely under `https://your-site-url.com/api/`, ex. `https://your-site-url.com/api/posts`, then this should be the only baseUrl setting you need.

If you need a different baseUrl per resource, ex. `https://your-site-url.com/api/posts` and `https://your-OTHER-site-url.com/api/comments`, you can set a specific baseUrl per resource that needs it. Any resource without a baseUrl setting will fallback to the top-level baseUrl setting.

A baseUrl is also not required at all, if you'd rather pass your resource's url on every railsAction call. The baseUrl can also be overriden per action, if needed. Just pass it in with your `railsAction`.

### resources
This is a mapping of your Rails resources. Resources can be plural (ex: posts) or singular (ex: post). Each resource has a list of optional attributes and one required attribute (controller)

**example
```js
const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    Posts: {
      controller: 'posts',
      parse: resp => resp.posts.map(p => p.title)
    },
    Comments: {
      controller: 'comments',
      idAttribute: '_id',
      baseUrl: 'https://your-OTHER-site-url.com/api/'
    },
    User: {
      controller: 'user',
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }
  }
}
```


### controller (required)
The controller attribute tells Redux Rails what specific url to make HTTP actions against. For example, the resource `Posts` could be found at `https://your-site-url.com/api/posts`. This would make the baseUrl for this resource `https://your-site-url.com/api/` and the controller `posts`. The controller does not need to match the name of the resource, though this is generally good practice for a RESTful api. If you're using Rails, the controller set here should probably match the one set in your routes file.

### parse (optional)
This can be either a single function or an object with two functions, `member` and `collection`. These functions are used to parse the response from your api, and its where you should do any data transformation before the data is added to your Redux store. `member` is used for responses related to a specific model and `collection` is used for responses to `index` calls.

Example of a single function for all resource types:
```js
const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    Posts: {
      controller: 'posts',
      parse: (resp) => {
        return {
          foo: 'bar',
          response: resp.posts
        }
      }
    }
  }
}
```

Example of a function for each resource type:
```js
const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    Posts: {
      controller: 'posts',
      parse: {
        member: resp => resp.posts,
        collection: (resp) => {
          return {
            foo: 'bar',
            response: resp.posts
          }
        }
      }
    }
  }
}
```

> Note: Index calls will automatically look for and use an array at the top-level key matching the name of your resource, if the response it receives is not an array.

```js
App.dispatch(railsActions.index({resource: 'Posts'}))

// if the response returns an array, this array will be used directly in the redux store, as expected.
// response: [ {}, {}, {} ]
App.getState().resources.Posts // => { loading: false, models: [ {}, {}, {} ] }

// if the response returns an object with an array under a key matching the resource name, that will be used
// response: { Posts: [ {}, {}, {} ] }
App.getState().resources.Posts // => { loading: false, models: [ {}, {}, {} ] }

// the resource name is not case sensitive here, so you can name your resource `Posts` but still use the key `posts`
// response: { posts: [ {}, {}, {} ] }

App.getState().resources.Posts // => { loading: false, models: [ {}, {}, {} ] }

// if it does not find an array in any of these cases, it will set an error
// response: { posts: {...} }
App.getState().resources.Posts // => { loading: false, loadingError: 'Bad data received from server. INDEX calls expect an array.', models: [] }
```
### setMetadata (optional)
The setMetadata option is a function which receives your raw JSON response as an argument, and should return an object. That object will be set at the top level of your model or collection along with the other metadata, such as loading state. This is great for things like pagination data.

Example of a setMetadata function
```js
const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    Posts: {
      controller: 'posts',
      paginated: true,
      setMetadata: (resp) => {
        const { pagination } = resp.meta
        return { pagination }
      }
    }
  }
}
```

This will put the data on the resp.meta.pagination object into the `posts` collection's metadata.

Later...
```js
App.dispatch(railsActions.index({resource: 'Posts'})).then(() => {
  App.getState().resources.Posts // => { loading: false, models: [ {}, {}, {} ], pagination: { ... } }
})
```

### paginated
By default, redux rails will empty out a collection when an `INDEX` action is used on a resource. The `paginated` option tells Redux Rails to persist the models in a collection between calls. New models are simply added to the collection, and any duplicate models will be overwritten by the new model (de-duped by `id`).

Example of paginated use
```js
const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    Posts: {
      controller: 'posts',
      paginated: true,
      setMetadata: (resp) => {
        const { pagination } = resp.meta
        return { pagination }
      }
    }
  }
}

App.getState().resources.Posts // => { loading: false, models: [ { id: 1, attriubtes: {} }  } ] }

App.dispatch(railsActions.index({resource: 'Posts', queryParam: { page: 2 } })).then(() => {
  App.getState().resources.Posts // => { loading: false, models: [ { id: 1, attriubtes: {} }, { id: 2, attriubtes: {}  }, { id: 3, attriubtes: {}  } ], pagination: { ... } }
})
```

### idAttribute (optional - default: id)
This is defaulted to `id` and tells Redux Rails which attribute on your resource is the unique identifier. If your api assigns ids to the attribute `_@@id`, for example, you would set `idAttribute` to `_@@id` for that specific resource or for all resources in the config. Models still get `id` set as metadata no matter the `idAttribute` setting.

Example with `idAttribute` set to `_@@id`:
```js
{
  loading: false,
  loadingError: undefined,
  id: 123,
  attributes: {
    `_@@id`: 123,
    first_name: 'Leia',
    last_name: 'Organa',
    title: 'General'
  }
}
```

### baseUrl (optional)
Url base for your resource(s). If you'd like a different baseUrl for a specific resource, you can set `baseUrl` on the resource level as well. If you're using multiple configs, each config can have a top-level baseUrl.

### Nested Resources
For actions with a rails route like `/v3/carts/:id/cart_total` where we need to access a nested action, we can use the wildcard ID matcher `/:id/` to let the middleware know this request is nested and interpolate the id appropriately. Here is an example configuration.

```js
const ApiConfig = {
  baseUrl: 'http://www.kibbles.com/',
  resources: {
    DogFriends: {
      controller: 'dogs/:id/friends'
    }
  }
}
```

### optimisticUpdateEnabled (optional - default: true)
Optimistic updates are on by default, but can be disabled per resource or per config using the `optimisticUpdateEnabled` attribute. Disabling optimistic updates will tell Redux Rails to wait for a successful server response before updating or creating models on the client. This can lead to a less responsive feeling app for users, but client state will exactly match the known state of the model on the server.

### fetchParams
These are the options sent to the `Fetch` call when making any call to your api. These map directly to the options available in the [Fetch Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request).

This is where you would set your headers or credentials, for example. This can be set per resource or top-level. Each config, if you're using multiple configs, can also have their own settings.

### queryParams
This attribute will be translated to the appropriate query string for GET requests.
Query params can be set globally at the top level of the apiConfig, per resource, or per call.
Valid values are primitives and arrays. Array values will be translated to the form `keyname[]=element0&keyname[]=element1`.

```
queryParams: {
  q: 'foobar',
  page: 2,
  categories: [3, 4]
}

// '?q=foobar&page=2&categories[]=3&categories[]=4'
```

### disableFetchQueueing
Fetch queueing can be disabled per config or per resource. Resources with fetch queueing disabled will not execute actions in the order they were called, but will instead execute actions in the order they are received from the server. *This makes your app susceptible to race conditions.* For example, if a user edits a posts and then edits it again very quickly, the first edit may return from the server after the second, giving the user a false representation of the post's state on the server.

*It's highly recommended that fetch queueing remain enabled unless you are very aware of the consequences.*

### reducer
If you'd like to add additional functionality to your resources, you can pass in a reducer per resource. For example, if you have a resource, `comments`, on the server and you want all of the default functionality given to you through Redux Rails but you also want a way to set some client-side state:

```js
const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    Comments: {
      controller: 'comments',
      reducer: (state={}, action) => {
        switch(action.type) {
          case 'Comments.MY_OWN_ACTION': {
            return Object.assign({}, state, {
              myAttribute: true
            })
          }
          default: {
            return state
          }
        }
      }
    }
  }
}
```

Of course, you can also create a large, richly defined reducer and simply import it and pass it along. Your own reducer may be as large or small as you need it to be.


```js
import myCommentsReducer from 'my/comments/reducer'

const apiConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  resources: {
    Comments: {
      controller: 'comments',
      reducer: myCommentsReducer
    }
  }
}
```

The same rules that apply to a regular Reducer apply to the reducer here ie. it must return state as a default case.

### Using multiple configs
Multiple configs can be used throughout your Redux store's hierarchy. Use `combineConfigs` to do this.

```js
import { createStore, applyMiddleware } from 'redux'
import { middleWare, apiReducer, combineConfigs } from 'redux-rails'

// these settings will be the fallback for all configs
const defaultConfig = {
  baseUrl: 'https://your-site-url.com/api/',
  fetchParams: {
    headers: {
      'content-type':'application/json'
    }
  }
}

const postsConfig = {
  resources: {
    Posts: {
      controller: 'posts'
    }
  }
}

const commentsConfig = {
  baseUrl: 'https://your-comments-site-url.com/api/',
  resources: {
    Comments: {
      controller: 'comments'
    }
  }
}

const reduxRailsConfigs = combineConfigs(
  defaultConfig
  postsConfig,
  commentsConfig
)

const App = createStore(
  combineReducers({
    posts: apiReducer(postsConfig),
    comments: apiReducer(commentsConfig)
  }),
  {},
  composeEnhancers(
    applyMiddleware(middleWare(reduxRailsConfigs))
  )
)
```

The first config given to `combineConfigs` is used as the default for top-level `baseUrl` and `fetchParams`. These can be overriden per config and per resource.

### Passing config as a function

If you need to determine some data for your config after your redux app has been instantiated, you can pass a function instead of an object as your config parameter. That function must return a valid config object.

The function will be passed the current redux store state during the middleware proccesses. This can be useful if you need redux state in your Redux Rails config.
> Note that the redux store will be an empty object on initialization. Your config function must be able to handle this. See example below.

```js
import { createStore, applyMiddleware, compose } from 'redux'
import { middleWare, apiReducer } from 'redux-rails'
import { myUtil } from 'my/utilities/directory'

const getMyConfig = (store = {}) => {
  return {
    baseUrl: 'https://your-site-url.com/api/',
    fetchParams: {
      headers: {
        'content-type':'application/json',
        'csrf-token': store.csrfToken, // get some data from the store
        'another-header': store.deep && store.deep.object.thing, // value in deep object must be ready for init empty store state
        'some-other-header': myUtil.getSomeData() // no longer hard-coded at initialization
      }
    }
    resources: {
      Posts: {
        controller: 'posts'
      },
      User: {
        controller: 'user'
      }
    }
  }
}

// Create your Redux store just like you would with an object

const App = createStore(
  {
    resources: apiReducer(getMyConfig) // auto-generates reducers
  },
  {},
  compose(
    applyMiddleware(middleWare(getMyConfig))
  )
)
```
