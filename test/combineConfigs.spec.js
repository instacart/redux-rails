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

  const configsWithMultiLevelDomains = {
    resources: {
      domain: 'http://mid-level-domain/',
      Cats: {
        controller: 'cats',
        domain: 'http://low-level-domain/',
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

    const finalConfig3 = {
      domain: 'http://localhost:3000/',
      resources: {
        Cats: {
          controller: 'cats',
          domain: 'http://low-level-domain/',
        },
        Comments: {
          domain: 'http://mid-level-domain/',
          controller: 'comments'
        },
        Posts: {
          domain: 'http://localhost:3000/',
          controller: 'posts'
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
    expect(combineConfigs(defaultConfig, configsWithMultiLevelDomains, postsConfig)).toEqual(finalConfig3)
  })

  it('should not mutate the original config objects', () => {

    const config1 = {
      domain: 'http://localhost:3000/',
      fetchParams: {
        headers: {
          'content-type':'application/json'
        }
      }
    }

    const config1Clean = {
      domain: 'http://localhost:3000/',
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
          domain: 'http://posts-own-domain/',
          controller: 'posts'
        }
      }
    }

    const config3Clean = {
      resources: {
        Posts: {
          domain: 'http://posts-own-domain/',
          controller: 'posts'
        }
      }
    }

    const config4 = {
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

    const config4Clean = {
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

    combineConfigs(config1, config2, config3, config4)
    expect(config1).toEqual(config1Clean)
    expect(config2).toEqual(config2Clean)
    expect(config3).toEqual(config3Clean)
    expect(config4).toEqual(config4Clean)
  })

})
