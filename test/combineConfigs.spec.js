import combineConfigs from '../src/combineConfigs'

describe('combineConfigs', () => {
  const defaultConfig = {
    domain: 'http://localhost:3000/',
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

  const postsConfigWithOwnDomain = {
    resources: {
      Posts: {
        domain: 'http://posts-own-domain/',
        controller: 'posts'
      }
    }
  }

  const configsWithMidLevelDomain = {
    resources: {
      domain: 'http://mid-level-domain/',
      Posts: {
        controller: 'posts'
      },
      Comments: {
        controller: 'comments'
      }
    }
  }

  it('should fall back on default config values', () => {
    const finalConfig = {
      domain: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts',
          domain: 'http://localhost:3000/'
        }
      },
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }

    const finalConfig2 = {
      resources: {
        Posts: {
          controller: 'posts'
        }
      }
    }

    expect(combineConfigs(defaultConfig, postsConfig)).toEqual(finalConfig)
    expect(combineConfigs({}, postsConfig)).toEqual(finalConfig2)
  })

  it('should use the domain specified closest to the resource\'s own config', () => {
    const finalConfig = {
      domain: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts',
          domain: 'http://posts-own-domain/'
        }
      },
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }

    const finalConfig2 = {
      domain: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts',
          domain: 'http://mid-level-domain/'
        },
        Comments: {
          controller: 'comments',
          domain: 'http://mid-level-domain/'
        }
      },
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }

    expect(combineConfigs(defaultConfig, postsConfigWithOwnDomain)).toEqual(finalConfig)
    expect(combineConfigs(defaultConfig, configsWithMidLevelDomain)).toEqual(finalConfig2)
  })
})
