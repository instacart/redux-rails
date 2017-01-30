export const standardConfig = {
  domain: 'http://localhost:3000/',
  resources: {
    Posts: {
      controller: 'posts',
      resp: (resp) => {
        return {
          metaFoo: 'metaBar',
          response: resp
        }
      }
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

export const commentsConfig = {
  resources: {
    Comments: {
      controller: 'comments'
    }
  }
}

export const configWithModelsReady = {
  domain: 'http://localhost:3000/',
  resources: {
    Posts: {
      controller: 'posts',
      models: [
        {id: 4, foo: 'bar4'},
        {id: 5, foo: 'bar5'},
        {id: 6, foo: 'bar6'}
      ]
    }
  }
}
