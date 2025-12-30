export type HeadingNode = {
  id: string
  text: string
  level: number
  children: HeadingNode[]
}

export const useHeadingTree = (containerRef: Ref<HTMLElement | null>) => {
  const headings = ref<HeadingNode[]>([])
  const activeId = ref('')
  const isClient = import.meta.client
  const scrollOffsetRatio = 0.3
  const bottomOffset = 50

  const buildHeadingId = (text: string, level: number, index: number) => {
    const normalized = text.trim().replace(/\s+/g, '-').toLowerCase()

    if (normalized.length > 0) {
      return normalized
    } else {
      return `heading-${level}-${index}`
    }
  }

  const extractFlatHeadings = () => {
    if (isClient) {
      const container = containerRef.value

      if (container) {
        const elements = Array.from(container.querySelectorAll('h2, h3, h4'))

        return elements.map((element, index) => {
          const text = element.textContent ? element.textContent.trim() : ''
          const level = Number.parseInt(element.tagName[1], 10)
          let finalId = ''

          if (element.id) {
            finalId = element.id
          } else {
            finalId = buildHeadingId(text, level, index)
          }

          element.id = finalId

          return {
            id: finalId,
            text,
            level,
            children: []
          }
        })
      } else {
        return []
      }
    } else {
      return []
    }
  }

  const buildHeadingTree = (flat: HeadingNode[]) => {
    const root: HeadingNode[] = []
    const stack: HeadingNode[] = []

    flat.forEach((heading) => {
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop()
      }

      const parent = stack[stack.length - 1]

      if (parent) {
        parent.children.push(heading)
      } else {
        root.push(heading)
      }

      stack.push(heading)
    })

    return root
  }

  const flattenHeadings = (nodes: HeadingNode[]): HeadingNode[] => {
    const result: HeadingNode[] = []

    nodes.forEach((node) => {
      result.push(node)

      if (node.children.length > 0) {
        result.push(...flattenHeadings(node.children))
      } else {
        return
      }
    })

    return result
  }

  const refreshHeadings = () => {
    const flatHeadings = extractFlatHeadings()
    headings.value = buildHeadingTree(flatHeadings)
  }

  const updateActiveHeading = () => {
    if (isClient) {
      const flatHeadings = flattenHeadings(headings.value)
      const elements = flatHeadings
        .map((heading) => document.getElementById(heading.id))
        .filter((element): element is HTMLElement => Boolean(element))

      if (elements.length > 0) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const windowHeight = window.innerHeight
        let currentActiveId = elements[0].id

        elements.forEach((element) => {
          const rect = element.getBoundingClientRect()

          if (rect.top <= windowHeight * scrollOffsetRatio) {
            currentActiveId = element.id
          } else {
            currentActiveId = currentActiveId
          }
        })

        const documentHeight = document.documentElement.scrollHeight
        const maxScrollTop = documentHeight - windowHeight

        if (scrollTop >= maxScrollTop - bottomOffset) {
          currentActiveId = elements[elements.length - 1].id
        } else {
          currentActiveId = currentActiveId
        }

        activeId.value = currentActiveId
      } else {
        activeId.value = ''
      }
    } else {
      activeId.value = ''
    }
  }

  const setupScrollTracking = () => {
    if (isClient) {
      window.addEventListener('scroll', updateActiveHeading)
    } else {
      return
    }
  }

  const teardownScrollTracking = () => {
    if (isClient) {
      window.removeEventListener('scroll', updateActiveHeading)
    } else {
      return
    }
  }

  onMounted(() => {
    if (isClient) {
      nextTick(() => {
        refreshHeadings()
        updateActiveHeading()
        setupScrollTracking()
      })
    } else {
      return
    }
  })

  onUnmounted(() => {
    teardownScrollTracking()
  })

  return {
    headings: readonly(headings),
    activeId: readonly(activeId),
    refreshHeadings,
    updateActiveHeading
  }
}
