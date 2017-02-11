import combineConfigs from '../src/combineConfigs'

describe('combineConfigs', () => {
  const defaultConfig = {
    baseUrl: 'http://localhost:3000/',
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

  const postsConfigWithOwnBaseUrl = {
    resources: {
      Posts: {
        baseUrl: 'http://posts-own-url/',
        controller: 'posts'
      }
    }
  }

  const configsWithMidLevelBaseUrl = {
    resources: {
      baseUrl: 'http://mid-level-url/',
      Posts: {
        controller: 'posts'
      },
      Comments: {
        controller: 'comments'
      }
    }
  }

  const configsWithMultiLevelBaseUrls = {
    resources: {
      baseUrl: 'http://mid-level-url/',
      Cats: {
        controller: 'cats',
        baseUrl: 'http://low-level-url/',
      },
      Comments: {
        controller: 'comments'
      }
    }
  }

  it('should fall back on default config values', () => {
    const finalConfig = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts',
          baseUrl: 'http://localhost:3000/'
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

  it('should use the baseUrl specified closest to the resource\'s own config', () => {
    const finalConfig = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts',
          baseUrl: 'http://posts-own-url/'
        }
      },
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }

    const finalConfig2 = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Posts: {
          controller: 'posts',
          baseUrl: 'http://mid-level-url/'
        },
        Comments: {
          controller: 'comments',
          baseUrl: 'http://mid-level-url/'
        }
      },
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }

    const finalConfig3 = {
      baseUrl: 'http://localhost:3000/',
      resources: {
        Cats: {
          controller: 'cats',
          baseUrl: 'http://low-level-url/',
        },
        Comments: {
          baseUrl: 'http://mid-level-url/',
          controller: 'comments'
        },
        Posts: {
          baseUrl: 'http://localhost:3000/',
          controller: 'posts'
        }
      },
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }

    expect(combineConfigs(defaultConfig, postsConfigWithOwnBaseUrl)).toEqual(finalConfig)
    expect(combineConfigs(defaultConfig, configsWithMidLevelBaseUrl)).toEqual(finalConfig2)
    expect(combineConfigs(defaultConfig, configsWithMultiLevelBaseUrls, postsConfig)).toEqual(finalConfig3)
  })

  it('should not mutate the original config objects', () => {

    const config1 = {
      baseUrl: 'http://localhost:3000/',
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }

    const config1Clean = {
      baseUrl: 'http://localhost:3000/',
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }

    const config2 = {
      resources: {
        Posts: {
          controller: 'posts'
        }
      }
    }

    const config2Clean = {
      resources: {
        Posts: {
          controller: 'posts'
        }
      }
    }

    const config3 = {
      resources: {
        Posts: {
          baseUrl: 'http://posts-own-url/',
          controller: 'posts'
        }
      }
    }

    const config3Clean = {
      resources: {
        Posts: {
          baseUrl: 'http://posts-own-url/',
          controller: 'posts'
        }
      }
    }

    const config4 = {
      resources: {
        baseUrl: 'http://mid-level-url/',
        Posts: {
          controller: 'posts'
        },
        Comments: {
          controller: 'comments'
        }
      }
    }

    const config4Clean = {
      resources: {
        baseUrl: 'http://mid-level-url/',
        Posts: {
          controller: 'posts'
        },
        Comments: {
          controller: 'comments'
        }
      }
    }

    combineConfigs(config1, config2, config3, config4)
    expect(config1).toEqual(config1Clean)
    expect(config2).toEqual(config2Clean)
    expect(config3).toEqual(config3Clean)
    expect(config4).toEqual(config4Clean)
  })

})
