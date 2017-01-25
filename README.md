React Rails
=========================

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

Fetch list of members from a resource collection
```
App.dispatch(railsActions.index({resource: 'Posts'}))
```

### show

Fetch a specific member from a resource collection
```
App.dispatch(railsActions.show({
  resource: 'Posts',
  id: 3
}))
```

### update

Update a specific member of a resource collection
```
App.dispatch(railsActions.Update({
  resource: 'Posts',
  id: 3,
  attributes: {
    title: 'foo',
    body: 'bar'
  }
}))
```

### create

Create a new member in a resource collection
```
App.dispatch(railsActions.Create({
  resource: 'Posts',
  attributes: {
    title: 'foo',
    body: 'bar'
  }
}))
```

### destroy

Destroy a specific member inside a resource collection
```
App.dispatch(railsActions.Destroy({
  resource: 'Posts',
  id: 3
}))
```

## Usage with React-Redux

First, set up your Redux Rails config, set up your apiReducer and apply the Redux Rails middle ware

```
import { railsActions } from 'redux-rails'

const MyReactComponent = React.createClass({
  propTypes: {
    fetchPosts: React.PropTypes.func,
    loading: React.PropTypes.bool
  },

  componentWillMount() {
    this.props.fetchPosts()
  },

  render() {
    if (this.props.loading) { return <p>Loading Posts...</p> }

    return (
      <ul>
        {this.props.Posts.map(post) => {
          return (
            <li>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
            </li>
          )
        }}
      </ul>
    )
  }
})

const mapStateToProps = (state) => {
  return {
    loading: state.resources.Posts.loading
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPosts: bindActionCreators(Object.assign({}, () => { railsActions.index({ resource: 'Posts'}) }), dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent)
```
