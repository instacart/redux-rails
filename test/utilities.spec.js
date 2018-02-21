import {
  determineResourceType,
  getConfig,
  getResourceNameSpace,
  getResourceIdAttribute,
  getUniqueClientId
} from '../src/utilities'

describe('utilities', () => {

  describe('determineResourceType', () => {
    it('should return collection for plural controller', () => {
      expect(determineResourceType({controller: 'posts'})).toEqual('collection')
    })

    it('should return member for singular controller', () => {
      expect(determineResourceType({controller: 'post'})).toEqual('member')
    })
  })

  describe('getResourceNameSpace', () => {
    const config1 = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts'
        },
        User: {
          controller: 'user'
        }
      }
    }
    const config2 = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'retailers'
        },
        User: {
          controller: 'users'
        },
        Cats: {
          controller: 'cat'
        }
      }
    }

    it('should return models for plural controller', () => {
      expect(getResourceNameSpace({config: config1, resource: 'Posts'})).toEqual('models')
      expect(getResourceNameSpace({config: config2, resource: 'Posts'})).toEqual('models')
      expect(getResourceNameSpace({config: config2, resource: 'User'})).toEqual('models')
    })

    it('should return attributes for singular controller', () => {
      expect(getResourceNameSpace({config: config1, resource: 'User'})).toEqual('attributes')
      expect(getResourceNameSpace({config: config2, resource: 'Cats'})).toEqual('attributes')
    })
  })

  describe('getResourceIdAttribute', () => {
    const config = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts',
          idAttribute: '_id'
        },
        User: {
          controller: 'user',
          idAttribute: '_id___1234%%@@_'
        },
        Photos: {
          controller: 'photo'
        }
      }
    }

    it('should return default id attribute', () => {
      expect(getResourceIdAttribute({config, resource: 'Photos'})).toEqual('id')
    })

    it('should return custom id attribute', () => {
      expect(getResourceIdAttribute({config, resource: 'Posts'})).toEqual('_id')
      expect(getResourceIdAttribute({config, resource: 'User'})).toEqual('_id___1234%%@@_')
    })
  })

  describe('getUniqueClientId', () => {
    it('should return +1 ints', () => {
      expect(getUniqueClientId()).toEqual(1)
      expect(getUniqueClientId()).toEqual(2)
      expect(getUniqueClientId()).toEqual(3)
    })

    it('should return unique ints', () => {
      const int1 = getUniqueClientId()
      const int2 = getUniqueClientId()
      const int3 = getUniqueClientId()
      const int4 = getUniqueClientId()

      expect(int1).not.toEqual(int2)
      expect(int1).not.toEqual(int3)
      expect(int1).not.toEqual(int4)
      expect(int2).not.toEqual(int3)
      expect(int2).not.toEqual(int4)
      expect(int3).not.toEqual(int4)
    })
  })
  
  describe('getConfig', () => {
    it('should return config object when passed object', () => {
      const config = {
        baseUrl: 'http://localhost:3000/',
        resources: {
          Posts: {
            controller: 'posts'
          },
          User: {
            controller: 'user'
          }
        }
      }

      expect(getConfig({config})).toEqual(config)
    })

    it('should return config object when passed function', () => {
      const config = {
        baseUrl: 'http://localhost:3000/',
        resources: {
          Posts: {
            controller: 'posts'
          },
          User: {
            controller: 'user'
          }
        }
      }

      const configFunc = () => {
        return config
      }

      expect(getConfig({config: configFunc})).toEqual(config)
    })

    it('should be able to use store state when passed back', () => {
      const config = {
        baseUrl: 'http://localhost:3000/',
        fetchParams: {
          headers: {
            'some-header': 'testString'
          }
        },
        resources: {
          Posts: {
            controller: 'posts'
          },
          User: {
            controller: 'user'
          }
        }
      }

      const configFunc = (storeState = {}) => {
        return {
          baseUrl: 'http://localhost:3000/',
          fetchParams: {
            headers: {
              'some-header': storeState.testData
            }
          },
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

      expect(getConfig({config: configFunc, store: { testData: 'testString' }})).toEqual(config)
    })

    it('should be able to handle no store state', () => {
      const configWithoutStore = {
        baseUrl: 'http://localhost:3000/',
        fetchParams: {
          headers: {
            'some-header': undefined
          }
        },
        resources: {
          Posts: {
            controller: 'posts'
          },
          User: {
            controller: 'user'
          }
        }
      }
      
      const configFunc = (storeState = {}) => {
        return {
          baseUrl: 'http://localhost:3000/',
          fetchParams: {
            headers: {
              'some-header': storeState.testData
            }
          },
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

      expect(getConfig({config: configFunc})).toEqual(configWithoutStore)
    })
  })
})
