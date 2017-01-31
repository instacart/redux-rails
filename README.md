Redux Rails
=========================
[![Build Status](https://travis-ci.com/instacart/redux-rails.svg?token=QDSMJH3hiak5dQzToZJx&branch=master)](https://travis-ci.com/instacart/redux-rails)

## Basic Usage

### Import necessary tools

```
import { createStore, applyMiddleware, compose } from 'redux'
import { middleWare, apiReducer, railsActions } from 'redux-rails'
```

### Set up your config

```
const apiConfig = {
  domain: 'https://your-site-url.com/api/',
  resources: {
    Posts: {
      controller: 'posts'
    }
  }
}
```

### Create your Redux store

```
const App = createStore(
  {
    resources: apiReducer(apiConfig)
  },
  {},
  compose(
    applyMiddleware(middleWare(apiConfig))
  )
)
```

### Fetch your resources

```
App.dispatch(railsActions.show({
  resource: 'Posts',
  id: 3
}))
```

### Use your fetched resources
```
console.log(App.getState().resources.Posts)

```

## Available Rails Actions

### index

Fetch list of members from a resource collection.
```
App.dispatch(railsActions.index({resource: 'Posts'}))
```

HTTP GET on resources. Example: `GET http://my-domain/myapi/posts`


### show

Fetch a specific member from a resource collection
```
App.dispatch(railsActions.show({
  resource: 'Posts',
  id: 3
}))
```
HTTP GET on specific member in resources. Example: `GET http://my-domain/myapi/posts/3`

### update

Update a specific member of a resource collection
```
App.dispatch(railsActions.update({
  resource: 'Posts',
  id: 3,
  attributes: {
    title: 'foo',
    body: 'bar'
  }
}))
```

HTTP PUT on specific member in resources. Example: `PUT http://my-domain/myapi/posts/3`

### create

Create a new member in a resource collection
```
App.dispatch(railsActions.create({
  resource: 'Posts',
  attributes: {
    title: 'foo',
    body: 'bar'
  }
}))
```

HTTP POST on resources. Example: `POST http://my-domain/myapi/posts`

### destroy

Destroy a specific member inside a resource collection
```
App.dispatch(railsActions.destroy({
  resource: 'Posts',
  id: 3
}))
```

HTTP DELETE on specific member in resources. Example: `DELETE http://my-domain/myapi/posts/3`

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

```
const apiConfig = {
  domain: 'https://your-site-url.com/api/',
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

```
  App.dispatch(railsActions.show({resource: 'user'}))
  // GET https://your-site-url.com/api/user
```

With the exception of `create`, plural resources require a member id, and the id is added to the constructed url.

```
  App.dispatch(railsActions.show({resource: 'users', id: 123}))
  // GET https://your-site-url.com/api/users/123
```

With user(s) as an example resource, and `https://your-site-url.com/api/` as your domain, your url structures would look like this for different rails actions.

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
Plural resources create a collection with a set of models while singular resources create a model with a set of attributes. 

```
import { createStore, applyMiddleware, compose } from 'redux'
import { middleWare, apiReducer, railsActions } from 'redux-rails'

  const config = {
    domain: 'https://your-site-url.com/api/',
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
        loading: false,
        loadingError: undefined,
        attributes: {
          first_name: 'Leia',
          last_name: 'Organa',
          title: 'General'
        }
      },
      Users: {
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
Models are always an object with meta data and an attributes object:
```
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

The `idAttribute` set on the config is used to create the id in the meta data. For example, if the `idAttribute` was set to `__id`, the model would be:
```
{
  loading: false,
  loadingError: undefined,
  id: 123,
  attributes: {
    __id: 123,
    first_name: 'Leia',
    last_name: 'Organa',
    title: 'General'
  }
}
```

### Collection
Collections are an object with meta data and an array of models.
```
Users: {
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

Models within a collection can be updated, destroyed, or refetched using `railsActions`.

```
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

### Meta data
Models and collections each get a few pieces of meta data. Some are optional and some are always around
- **loading** - true while any rails action is currently awaiting a response from the server.
- **loadingError** - any error that occurred during the last rails action. Cleared on subsequent actions.
- **id (optional)** - the id of the model/resource member.
- **cId (optional)** - used for internal purposes only.

## Usage with React-Redux

First, set up your Redux Rails config, set up your apiReducer and apply the Redux Rails middle ware

```
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { railsActions } from 'redux-rails'

const MyReactComponent = React.createClass({
  propTypes: {
    fetchPosts: React.PropTypes.func,
    loading: React.PropTypes.bool,
    posts: React.PropTypes.array
  },

  componentWillMount() {
    this.props.fetchPosts()
  },

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
})

const mapStateToProps = (state) => {
  return {
    posts: state.resources.Posts.models,
    loading: state.resources.Posts.loading
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPosts: bindActionCreators(() => { railsActions.index({ resource: 'Posts'}) }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent)
```


## Config in depth
The Redux Rails config has many options. You can also use several configs along with several instances of the apiReducer to distribute your resources throughout your redux store's hierarchy.

A complex example of a Redux Rails config:
```
const apiConfig = {
  domain: 'https://your-site-url.com/api/',
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
      idAttribute: '_id',
      domain: 'https://your-OTHER-site-url.com/api/'
    }
  },
  fetchParams: {
    headers: {
      'content-type':'application/json'
    }
  }
}
```

### domain
This is the top level for all resources in the config. If your site's api is entirely under 'https://your-site-url.com/api/', ex. `'https://your-site-url.com/api/posts'`, then this should be the only domain setting you need.

If you need a different domain per resource, ex. 'https://your-site-url.com/api/posts' and 'https://your-OTHER-site-url.com/api/comments', you can set a specific domain per resource that needs needs it. Any resource without a domain set will fallback to this top-level domain setting.

### resources
This is a mapping of your Rails resources. Resources can be plural (ex: posts) or singular (ex: post). Each resource has a list of optional attributes and one required attribute (controller)

#### controller (required)
The controller attribute tells Redux Rails what specific url to make HTTP actions against. For example, the resource `Posts` could be found at `https://your-site-url.com/api/posts`. This would make the domain for this resource `https://your-site-url.com/api/` and the controller `posts`. The controller does not need to match the name of the resource, though this is generally good practice for a RESTful api.

#### parse (optional)
This can be either a single function or an object with two functions, `member` and `collection`. These functions are used to parse the response from your api, and its where you should do any data transformation before the data is added to your Redux store.

Example of a single function for all resource types:
```
const apiConfig = {
  domain: 'https://your-site-url.com/api/',
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
```
const apiConfig = {
  domain: 'https://your-site-url.com/api/',
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

#### idAttribute (optional)
This is defaulted to `id` and tells Redux Rails which attribute on your resource is the unique identifier.

#### domain (optional)
If you'd like a different domain for a specific resource, you can set `domain` on the resource level as well.

### fetchParams
These are the options sent to the `Fetch` call when making any call to your api. These map directly to the options available in the [Fetch Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request).

This is where you would set your headers or credentials, for example.

### Using multiple configs
Multiple configs can be used throughout your Redux store's hierarchy. Use combineConfigs to do this.

```
import { createStore, applyMiddleware } from 'redux'
import { middleWare, apiReducer, combineConfigs } from 'redux-rails'

// these settings will be the fallback for all configs
const defaultConfig = {
  domain: 'https://your-site-url.com/api/',
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
  domain: 'https://your-comments-site-url.com/api/',
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

The first config given to `combineConfigs` is used as the default for top-level `domain` and `fetchParams`. These can be overriden per config and per resource. 
