const buildErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message || '请求失败'
  } else {
    return '请求失败'
  }
}

const fetchSiteFeed = async (site) => {
  try {
    const data = await $fetch('/api/friends', {
      query: {
        url: site.siteUrl
      }
    })

    const siteResult = Array.isArray(data?.results) ? data.results[0] : undefined

    if (siteResult && siteResult.error) {
      return {
        articles: [],
        failedFeed: {
          siteName: site.siteName,
          siteUrl: site.siteUrl,
          errorMessage: siteResult.errorMessage || '未知错误'
        }
      }
    } else if (siteResult && Array.isArray(siteResult.articles) && siteResult.articles.length > 0) {
      const articles = siteResult.articles.map((article) => {
        return {
          ...article,
          siteName: site.siteName,
          siteLogo: site.siteLogo,
          siteUrl: site.siteUrl
        }
      })

      return {
        articles,
        failedFeed: null
      }
    } else {
      return {
        articles: [],
        failedFeed: null
      }
    }
  } catch (error) {
    return {
      articles: [],
      failedFeed: {
        siteName: site.siteName,
        siteUrl: site.siteUrl,
        errorMessage: buildErrorMessage(error)
      }
    }
  }
}

const buildFeedResult = (results) => {
  const articles = []
  const failedFeeds = []

  results.forEach((result) => {
    if (result.articles.length > 0) {
      articles.push(...result.articles)
    } else {
      articles.push(...[])
    }

    if (result.failedFeed) {
      failedFeeds.push(result.failedFeed)
    } else {
      failedFeeds.push(...[])
    }
  })

  const sortedArticles = [...articles].sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return {
    articles: sortedArticles,
    failedFeeds
  }
}

const fetchFriendsFeed = async (sites) => {
  if (sites.length > 0) {
    const results = await Promise.all(sites.map((site) => fetchSiteFeed(site)))
    return buildFeedResult(results)
  } else {
    return {
      articles: [],
      failedFeeds: []
    }
  }
}

export const useFriendsFeed = (sites, options) => {
  const pageSize = typeof options?.pageSize === 'number' ? options.pageSize : 10
  const currentPage = ref(0)
  const loadingMore = ref(false)

  const { data, status, error, refresh } = useAsyncData(
    () => `friends-feed-${sites.value.length}`,
    () => fetchFriendsFeed(sites.value),
    {
      watch: [sites],
      default: () => ({
        articles: [],
        failedFeeds: []
      })
    }
  )

  const articles = computed(() => {
    return data.value.articles
  })

  const failedFeeds = computed(() => {
    return data.value.failedFeeds
  })

  const displayedArticles = computed(() => {
    const end = (currentPage.value + 1) * pageSize
    return articles.value.slice(0, end)
  })

  const hasMore = computed(() => {
    return displayedArticles.value.length < articles.value.length
  })

  const refreshFeed = async () => {
    currentPage.value = 0
    await refresh()
  }

  const loadMore = () => {
    if (!loadingMore.value && hasMore.value) {
      loadingMore.value = true
      setTimeout(() => {
        currentPage.value = currentPage.value + 1
        loadingMore.value = false
      }, 300)
    } else {
      return
    }
  }

  return {
    status,
    error,
    articles,
    displayedArticles,
    failedFeeds,
    hasMore,
    loadingMore: readonly(loadingMore),
    refreshFeed,
    loadMore
  }
}
