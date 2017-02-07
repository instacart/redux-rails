export const standardConfig = {
  domain: 'http://localhost:3000/',
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

export const configWithParse = {
  domain: 'http://localhost:3000/',
  resources: {
    Posts: {
      controller: 'posts',
      parse: (resp) => { return { data: resp } }
    },
    Comments: {
      controller: 'comments',
      parse: {
        collection: (resp) => { return resp.map(m => Object.assign({}, m, { extraData: 'extra'})) },
        member: (resp) => { return { memberData: resp } }
      }
    }
  },
  fetchParams: {
    headers: {
      'content-type':'application/json'
    }
  }
}

export const configWithBadCollectionParse = {
  domain: 'http://localhost:3000/',
  resources: {
    Posts: {
      controller: 'posts',
      parse: (resp) => { return { data: resp } }
    },
    Comments: {
      controller: 'comments',
      parse: {
        collection: (resp) => { return { collectionData: resp } },
        member: (resp) => { return { memberData: resp } }
      }
    }
  },
  fetchParams: {
    headers: {
      'content-type':'application/json'
    }
  }
}

export const configWithCustomReducer = {
  domain: 'http://localhost:3000/',
  resources: {
    Comments: {
      controller: 'comments',
      reducer: (state, action) => {
        switch(action.type) {
          case 'Comments.CUSTOM_ACTION': {
            return Object.assign({}, state, {
              customAttribute: 'CUSTOM ACTION WUZ HERE'
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
    }
  }
}
