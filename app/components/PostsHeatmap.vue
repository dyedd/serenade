<template>
  <aside class="posts-heatmap">
    <div class="heatmap-header">
      <div class="heatmap-title">
        <svg class="heatmap-icon" aria-hidden="true">
          <use xlink:href="#icon-tongji"></use>
        </svg>
        <span>统计</span>
      </div>
      <div v-if="summaryLines.length > 0" class="heatmap-subtitle">
        <span
          v-for="(line, index) in summaryLines"
          :key="index"
          class="heatmap-subtitle-line"
        >
          {{ line }}
        </span>
      </div>
      <div v-else class="heatmap-subtitle"></div>
    </div>
    <div v-if="hasError" class="heatmap-empty">加载失败</div>
    <div v-else-if="isLoading" class="heatmap-loading">加载中...</div>
    <div v-else-if="weeks.length > 0" class="heatmap-body">
      <div class="heatmap-grid">
        <div class="weekday-labels">
          <span class="weekday-label">周日</span>
          <span class="weekday-label">周一</span>
          <span class="weekday-label">周二</span>
          <span class="weekday-label">周三</span>
          <span class="weekday-label">周四</span>
          <span class="weekday-label">周五</span>
          <span class="weekday-label">周六</span>
        </div>
        <div class="weeks-grid">
          <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="week-column">
            <span
              v-for="(day, dayIndex) in week"
              :key="dayIndex"
              class="day-cell"
              :class="day.className"
              :title="day.title"
            ></span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="heatmap-empty">暂无数据</div>
  </aside>
</template>

<script setup>
const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

const weeksToShow = 14
const daysToShow = weeksToShow * 7
const summaryDays = 365
const englishMonthMap = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11
}

const normalizeDate = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const parsePostDate = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)

    if (isoMatch) {
      const year = Number.parseInt(isoMatch[1], 10)
      const month = Number.parseInt(isoMatch[2], 10) - 1
      const day = Number.parseInt(isoMatch[3], 10)
      return new Date(year, month, day)
    } else {
      const englishMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/)

      if (englishMatch) {
        const monthIndex = englishMonthMap[englishMatch[1]]

        if (typeof monthIndex === 'number') {
          const year = Number.parseInt(englishMatch[3], 10)
          const day = Number.parseInt(englishMatch[2], 10)
          return new Date(year, monthIndex, day)
        } else {
          return null
        }
      } else {
        const parsed = new Date(trimmed)

        if (Number.isNaN(parsed.getTime())) {
          return null
        } else {
          return parsed
        }
      }
    }
  } else {
    return null
  }
}

const padNumber = (value) => {
  if (value < 10) {
    return `0${value}`
  } else {
    return String(value)
  }
}

const buildDateKey = (date) => {
  const year = date.getFullYear()
  const month = padNumber(date.getMonth() + 1)
  const day = padNumber(date.getDate())
  return `${year}-${month}-${day}`
}

const getWeekdayIndex = (date) => {
  return date.getDay()
}

const diffDays = (start, end) => {
  const ms = end.getTime() - start.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

const resolveLevel = (count) => {
  if (count >= 5) {
    return 4
  } else if (count >= 3) {
    return 3
  } else if (count >= 2) {
    return 2
  } else if (count >= 1) {
    return 1
  } else {
    return 0
  }
}

const buildTitle = (count, date) => {
  const label = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (count === 0) {
    return `无文章 · ${label}`
  } else if (count === 1) {
    return `1 篇文章 · ${label}`
  } else {
    return `${count} 篇文章 · ${label}`
  }
}

const buildCountsMap = (posts) => {
  const counts = new Map()

  posts.forEach((post) => {
    let dateValue = null

    if (post && typeof post === 'object') {
      dateValue = post.date
    } else {
      dateValue = null
    }

    const date = parsePostDate(dateValue)

    if (date) {
      const key = buildDateKey(date)
      const current = counts.get(key)

      if (typeof current === 'number') {
        counts.set(key, current + 1)
      } else {
        counts.set(key, 1)
      }
    } else {
      return
    }
  })

  return counts
}

const buildHeatmap = (counts) => {
  const today = normalizeDate(new Date())
  const rangeStart = new Date(today)
  rangeStart.setDate(rangeStart.getDate() - daysToShow + 1)

  const gridStart = new Date(rangeStart)
  gridStart.setDate(gridStart.getDate() - getWeekdayIndex(gridStart))

  const gridEnd = new Date(today)
  gridEnd.setDate(gridEnd.getDate() + (6 - getWeekdayIndex(gridEnd)))

  const totalDays = diffDays(gridStart, gridEnd) + 1
  const weekCount = Math.ceil(totalDays / 7)
  const weeks = []
  let activeDays = 0
  let totalPosts = 0

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    const week = []

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const offset = weekIndex * 7 + dayIndex
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + offset)

      const inRange = date >= rangeStart && date <= today
      let count = 0
      let className = 'level-empty'
      let title = ''

      if (inRange) {
        const key = buildDateKey(date)
        const stored = counts.get(key)

        if (typeof stored === 'number') {
          count = stored
        } else {
          count = 0
        }

        totalPosts += count

        if (count > 0) {
          activeDays += 1
        } else {
          activeDays = activeDays
        }

        className = `level-${resolveLevel(count)}`
        title = buildTitle(count, date)
      } else {
        count = 0
        className = 'level-empty'
        title = ''
      }

      week.push({
        date,
        count,
        inRange,
        className,
        title
      })
    }

    weeks.push(week)
  }

  return {
    weeks,
    activeDays,
    totalPosts
  }
}

const countsMap = computed(() => {
  let rawPosts = []

  if (Array.isArray(props.posts)) {
    rawPosts = props.posts
  } else {
    rawPosts = []
  }
  return buildCountsMap(rawPosts)
})

const buildSummary = (counts) => {
  const today = normalizeDate(new Date())
  const rangeStart = new Date(today)
  rangeStart.setDate(rangeStart.getDate() - summaryDays + 1)
  let activeDays = 0
  let totalPosts = 0

  for (let offset = 0; offset < summaryDays; offset += 1) {
    const date = new Date(rangeStart)
    date.setDate(rangeStart.getDate() + offset)
    const key = buildDateKey(date)
    const stored = counts.get(key)
    let count = 0

    if (typeof stored === 'number') {
      count = stored
    } else {
      count = 0
    }

    totalPosts += count

    if (count > 0) {
      activeDays += 1
    } else {
      activeDays = activeDays
    }
  }

  return {
    activeDays,
    totalPosts
  }
}

const buildTotalLabel = (count) => {
  if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
    return `共 ${count} 篇文章`
  } else {
    return ''
  }
}

const appendSummaryLine = (lines, value) => {
  const hasValue = typeof value === 'string' && value.length > 0

  if (hasValue) {
    const next = lines.slice()
    next.push(value)
    return next
  } else {
    return lines
  }
}

const heatmapData = computed(() => {
  return buildHeatmap(countsMap.value)
})

const summaryData = computed(() => {
  return buildSummary(countsMap.value)
})

const weeks = computed(() => {
  return heatmapData.value.weeks
})

const activityLabel = computed(() => {
  const activeDays = summaryData.value.activeDays
  const totalPosts = summaryData.value.totalPosts

  if (activeDays > 0) {
    return `过去一年 ${activeDays} 天有更新`
  } else if (totalPosts > 0) {
    return `过去一年 ${totalPosts} 篇文章`
  } else {
    return ''
  }
})

const totalLabel = computed(() => {
  return buildTotalLabel(props.totalCount)
})

const summaryLines = computed(() => {
  const withTotal = appendSummaryLine([], totalLabel.value)
  const withActivity = appendSummaryLine(withTotal, activityLabel.value)
  return withActivity
})
</script>

<style scoped>
.posts-heatmap {
  --cell-size: 14px;
  --cell-gap: 2px;
  padding: 0;
  border: none;
  background: transparent;
  margin-bottom: 1.5rem;
}

.heatmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.heatmap-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(var(--color-neutral-800));
}

.heatmap-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: rgb(var(--color-primary-600));
}

.heatmap-subtitle {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  font-size: 0.7rem;
  color: var(--text-color-2);
  text-align: right;
}

.heatmap-subtitle-line {
  line-height: 1.2;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: 34px 1fr;
  padding-top: 0.5rem;
}

.weekday-labels {
  display: grid;
  grid-template-rows: repeat(7, var(--cell-size));
  gap: var(--cell-gap);
  font-size: 0.65rem;
  color: var(--text-color-2);
  padding-right: 6px;
}

.weekday-label {
  height: var(--cell-size);
  line-height: var(--cell-size);
  font-size: 0.6rem;
}

.weeks-grid {
  display: flex;
  gap: var(--cell-gap);
}

.week-column {
  display: grid;
  grid-template-rows: repeat(7, var(--cell-size));
  gap: var(--cell-gap);
}

.day-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  border-radius: 0;
  background: rgba(var(--color-neutral-200), 0.6);
}

.day-cell.level-0 {
  background: rgba(var(--color-neutral-200), 0.7);
}

.day-cell.level-1 {
  background: rgba(var(--color-primary-300), 0.5);
}

.day-cell.level-2 {
  background: rgba(var(--color-primary-400), 0.6);
}

.day-cell.level-3 {
  background: rgba(var(--color-primary-500), 0.7);
}

.day-cell.level-4 {
  background: rgba(var(--color-primary-600), 0.8);
}

.day-cell.level-empty {
  background: transparent;
}

.heatmap-loading,
.heatmap-empty {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-color-2);
  padding: 1.5rem 0;
}

:global(.dark) .heatmap-title {
  color: rgb(var(--color-neutral-200));
}

:global(.dark) .heatmap-icon {
  color: rgb(var(--color-primary-400));
}

:global(.dark) .day-cell.level-0 {
  background: rgba(var(--color-neutral-700), 0.8);
}

:global(.dark) .day-cell.level-1 {
  background: rgba(var(--color-primary-700), 0.5);
}

:global(.dark) .day-cell.level-2 {
  background: rgba(var(--color-primary-600), 0.65);
}

:global(.dark) .day-cell.level-3 {
  background: rgba(var(--color-primary-500), 0.8);
}

:global(.dark) .day-cell.level-4 {
  background: rgba(var(--color-primary-400), 0.9);
}
</style>
