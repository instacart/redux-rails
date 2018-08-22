export const standardConfig = {
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

export const standardFuncConfig = () => {
  return standardConfig
}

export const commentsConfig = {
  resources: {
    Comments: {
      controller: 'comments'
    }
  }
}

export const configWithModelsReady = {
  baseUrl: 'http://localhost:3000/',
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
  baseUrl: 'http://localhost:3000/',
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
  baseUrl: 'http://localhost:3000/',
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
  baseUrl: 'http://localhost:3000/',
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

export const configWithMetaDataSetting = {
  baseUrl: 'http://localhost:3000/',
  resources: {
    Cats: {
      controller: 'cats',
      paginated: true,
      parse: resp => resp.cats,
      setMetadata: (resp) => {
        const { pagination } = resp.meta
        return { pagination }
      }
    }
  }
}

export const configWithNestedModelAction = {
  baseUrl: 'http://localhost:3000/',
  resources: {
    DogFriend: {
      controller: 'dogs/:id/friend'
    }
  }
}

export const configWithOptimisticUpdateDisableOnOneResource = {
  baseUrl: 'http://localhost:3000/',
  resources: {
    Posts: {
      controller: 'posts',
      parse: (resp) => { return { data: resp } }
    },
    Comments: {
      controller: 'comments',
      optimisticUpdateEnabled: false
    }
  }
}

export const configWithOptimisticUpdateDisableOnSingularResource = {
  baseUrl: 'http://localhost:3000/',
  resources: {
    Posts: {
      controller: 'posts',
      parse: (resp) => { return { data: resp } }
    },
    User: {
      controller: 'user',
      optimisticUpdateEnabled: false
    }
  }
}

export const configWithOptimisticUpdateDisableOnTopLevel = {
  baseUrl: 'http://localhost:3000/',
  optimisticUpdateEnabled: false,
  resources: {
    Posts: {
      controller: 'posts',
      parse: (resp) => { return { data: resp } }
    },
    User: {
      controller: 'user'
    }
  }
}
