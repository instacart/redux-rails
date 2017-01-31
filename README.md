Redux Rails
=========================
[![Build Status](https://travis-ci.com/instacart/redux-rails.svg?token=QDSMJH3hiak5dQzToZJx&branch=master)](https://travis-ci.com/instacart/redux-rails)

## Basic Usage

### Import necessary tools

```
import { createStore, applyMiddleware } from 'redux'
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
  composeEnhancers(
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
  
| Redux Rails action | HTTP Method
| -----------------  | -----------  |
| INDEX              | GET          |
| SHOW               | GET          |
| CREATE             | POST         |
| UPDATE             | PUT          |
| DESTROY            | DELETE       |

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
