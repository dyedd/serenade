type ColumnMeta = {
  title?: string
  type?: string
  description?: string
  date?: string
}

type ChapterMeta = {
  title?: string
}

type Chapter = {
  fileName: string
  metaData: ChapterMeta
  htmlContent?: string
}

type ColumnDataResponse = {
  metaData: ColumnMeta
  readmeHtml: string
  chapters: Chapter[]
}

const resolveString = (value: unknown) => {
  if (typeof value === 'string') {
    return value
  } else {
    return ''
  }
}

const normalizeSlug = (slug: string) => {
  if (slug.endsWith('.md')) {
    return slug.replace(/\.md$/, '')
  } else {
    return slug
  }
}

const createEmptyColumn = (): ColumnDataResponse => {
  return {
    metaData: {},
    readmeHtml: '',
    chapters: []
  }
}

export const useColumnDetail = async () => {
  const route = useRoute()
  const router = useRouter()
  const isClient = import.meta.client

  const columnPath = computed(() => {
    return resolveString(route.params.path)
  })

  const { data: columnData, status, error } = await useFetch<ColumnDataResponse>(
    () => `/api/columns/${columnPath.value}`,
    {
      watch: [columnPath],
      default: createEmptyColumn
    }
  )

  const columnMeta = ref<ColumnMeta>({})
  const readmeHtml = ref('')
  const chapters = ref<Chapter[]>([])
  const currentChapterIndex = ref<number | null>(null)
  const chapterLoading = ref(false)

  const currentChapter = computed(() => {
    const index = currentChapterIndex.value

    if (typeof index === 'number') {
      return chapters.value[index] ?? null
    } else {
      return null
    }
  })

  const isLoading = computed(() => {
    return status.value === 'pending' || chapterLoading.value
  })

  const updateBaseData = (data: ColumnDataResponse) => {
    columnMeta.value = data.metaData ?? {}
    readmeHtml.value = data.readmeHtml ?? ''

    if (Array.isArray(data.chapters)) {
      chapters.value = data.chapters
    } else {
      chapters.value = []
    }
  }

  watch(
    columnData,
    (data) => {
      if (data) {
        updateBaseData(data)
        currentChapterIndex.value = null
      } else {
        updateBaseData(createEmptyColumn())
        currentChapterIndex.value = null
      }
    },
    { immediate: true }
  )

  const findChapterIndexBySlug = (slug: string) => {
    const directIndex = chapters.value.findIndex((chapter) => chapter.fileName === slug)

    if (directIndex !== -1) {
      return directIndex
    } else {
      const normalized = normalizeSlug(slug)
      const normalizedIndex = chapters.value.findIndex((chapter) => normalizeSlug(chapter.fileName) === normalized)

      if (normalizedIndex !== -1) {
        return normalizedIndex
      } else {
        return -1
      }
    }
  }

  const loadChapterContent = async (index: number) => {
    const isValidIndex = index >= 0 && index < chapters.value.length

    if (isValidIndex) {
      const chapter = chapters.value[index]

      if (chapter && chapter.htmlContent) {
        return chapter
      } else {
        chapterLoading.value = true

        try {
          const fileName = chapter.fileName
          const chapterData = await $fetch(`/api/columns/${columnPath.value}/${fileName}`)
          chapters.value[index] = { ...chapter, ...chapterData }
          return chapters.value[index]
        } finally {
          chapterLoading.value = false
        }
      }
    } else {
      return null
    }
  }

  const scrollToHash = (hash: string) => {
    if (isClient) {
      nextTick(() => {
        const element = document.querySelector(hash)

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
    } else {
      return
    }
  }

  const scrollToTop = () => {
    if (isClient) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      return
    }
  }

  const updateSlugQuery = async (normalizedSlug: string, shouldUpdateUrl: boolean) => {
    if (shouldUpdateUrl) {
      if (route.query.slug !== normalizedSlug) {
        await router.push({
          query: { ...route.query, slug: normalizedSlug }
        })
      } else {
        return
      }
    } else {
      return
    }
  }

  const setCurrentChapterBySlug = async (slug: string, shouldUpdateUrl = true) => {
    const index = findChapterIndexBySlug(slug)

    if (index === -1) {
      currentChapterIndex.value = null
      return
    } else {
      currentChapterIndex.value = index
    }

    const normalizedSlug = normalizeSlug(slug)

    await updateSlugQuery(normalizedSlug, shouldUpdateUrl)

    await loadChapterContent(index)
    scrollToTop()
  }

  const setCurrentChapter = async (index: number) => {
    const isValidIndex = index >= 0 && index < chapters.value.length

    if (isValidIndex) {
      const fileName = chapters.value[index].fileName
      await setCurrentChapterBySlug(fileName, true)
    } else {
      return
    }
  }

  const updateOverviewQuery = async (hash: string, shouldUpdateUrl: boolean) => {
    if (shouldUpdateUrl) {
      await router.push({
        query: {},
        hash
      })
    } else {
      return
    }
  }

  const setOverview = async (shouldUpdateUrl = true) => {
    currentChapterIndex.value = null
    const hash = route.hash

    await updateOverviewQuery(hash, shouldUpdateUrl)

    if (hash) {
      scrollToHash(hash)
    } else {
      scrollToTop()
    }
  }

  const syncFromRoute = async () => {
    const slug = route.query.slug

    if (typeof slug === 'string' && slug.length > 0) {
      await setCurrentChapterBySlug(slug, false)
    } else {
      await setOverview(false)
    }
  }

  watch(
    () => route.query.slug,
    async () => {
      if (chapters.value.length > 0) {
        await syncFromRoute()
      } else {
        return
      }
    },
    { immediate: true }
  )

  watch(
    () => route.hash,
    (newHash) => {
      if (newHash) {
        scrollToHash(newHash)
      } else {
        return
      }
    }
  )

  const prevChapter = computed(() => {
    const index = currentChapterIndex.value

    if (index === null) {
      return null
    } else if (index === 0) {
      return null
    } else {
      const previous = chapters.value[index - 1]

      if (previous) {
        return {
          title: previous.metaData?.title,
          index: index - 1
        }
      } else {
        return null
      }
    }
  })

  const nextChapter = computed(() => {
    const index = currentChapterIndex.value

    if (index === null) {
      if (chapters.value.length > 0) {
        const first = chapters.value[0]
        return {
          title: first?.metaData?.title,
          index: 0
        }
      } else {
        return null
      }
    } else if (index >= chapters.value.length - 1) {
      return null
    } else {
      const next = chapters.value[index + 1]

      if (next) {
        return {
          title: next.metaData?.title,
          index: index + 1
        }
      } else {
        return null
      }
    }
  })

  return {
    status,
    error,
    isLoading,
    columnMeta: readonly(columnMeta),
    readmeHtml: readonly(readmeHtml),
    chapters: readonly(chapters),
    currentChapter,
    currentChapterIndex,
    prevChapter,
    nextChapter,
    setCurrentChapter,
    setOverview
  }
}
