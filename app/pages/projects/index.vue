<template>
  <header>
    <h1
      class="mt-0 text-4xl md:text-4xl text-3xl font-extrabold text-neutral-900 dark:text-neutral"
    >
      项目
      <span v-if="activeTab === 'all' && totalCount > 0" class="total-count">{{
        totalCount
      }}</span>
      🚀
    </h1>
  </header>

  <section
    class="mt-0 md:mt-4 prose flex max-w-full flex-col dark:prose-invert lg:flex-row"
  >
    <div class="min-h-0 min-w-0 max-w-prose grow">
      <blockquote class="text-sm md:text-base">
        <p>
          这里是我的折腾项目。还有些没有整理的项目，可以<a
            href="https://github.com/dyedd"
            target="_blank"
            rel="noopener"
            >访问我的 GitHub</a
          >
          查看/关注。
        </p>
      </blockquote>
    </div>
  </section>

  <!-- Tab 标签 -->
  <div class="project-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['tab-button', { active: activeTab === tab.key }]"
      @click="switchTab(tab.key)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="tab.count !== undefined" class="tab-count">{{
        tab.count
      }}</span>
    </button>
  </div>

  <!-- 分类项目列表 -->
  <section v-if="activeTab !== 'all'" class="projects-section">
    <div v-if="loading.categories[activeTab]" class="loading-grid">
      <div v-for="n in 6" :key="n" class="skeleton-card"></div>
    </div>

    <div v-else-if="error.categories[activeTab]" class="error-container">
      <div class="error-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h3 class="error-title">加载失败</h3>
      <p class="error-description">{{ error.categories[activeTab] }}</p>
      <button @click="loadCategoryProjects(activeTab)" class="retry-button">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        重试
      </button>
    </div>

    <div v-else class="category-projects-grid">
      <div
        v-for="(project, index) in currentCategoryProjects"
        :key="`${activeTab}-${index}`"
        class="category-project-card"
        @click="goToProject(project.link)"
      >
        <div v-if="project.cover" class="project-cover">
          <img
            :src="project.cover"
            :alt="project.name"
            loading="lazy"
            @error="handleImageError"
          />
        </div>
        <div class="project-content">
          <h3 class="project-title">{{ project.name }}</h3>
          <p class="project-description">{{ project.description }}</p>
          <div v-if="project.techStack" class="project-tech-stack">
            <span
              v-for="tech in project.techStack"
              :key="tech"
              class="tech-tag"
              >{{ tech }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        !loading.categories[activeTab] &&
        !error.categories[activeTab] &&
        currentCategoryProjects.length > 0
      "
      class="load-more-container"
    >
      <button
        v-if="hasMore.categories[activeTab]"
        @click="loadMoreCategory(activeTab)"
        :disabled="loadingMore.categories[activeTab]"
        class="load-more-button"
      >
        <svg
          v-if="loadingMore.categories[activeTab]"
          class="loading-spinner"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        {{ loadingMore.categories[activeTab] ? "加载中..." : "加载更多" }}
      </button>
      <p v-else class="end-message">已显示所有项目</p>
    </div>
  </section>

  <!-- 全部项目 -->
  <section v-else class="projects-section">
    <div v-if="loading.all" class="loading-grid">
      <div v-for="n in 6" :key="n" class="skeleton-card"></div>
    </div>

    <div v-else-if="error.all" class="error-container">
      <div class="error-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h3 class="error-title">加载失败</h3>
      <p class="error-description">{{ error.all }}</p>
      <button @click="loadAll()" class="retry-button">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        重试
      </button>
    </div>

    <div v-else class="all-projects-container">
      <!-- 分类项目 -->
      <div v-if="shuffledDisplayProjects.length > 0" class="projects-group">
        <div class="category-projects-grid">
          <div
            v-for="(project, index) in shuffledDisplayProjects"
            :key="`all-${index}`"
            class="category-project-card"
            @click="goToProject(project.link)"
          >
            <div v-if="project.cover" class="project-cover">
              <img
                :src="project.cover"
                :alt="project.name"
                loading="lazy"
                @error="handleImageError"
              />
            </div>
            <div class="project-content">
              <div class="project-category-badge">
                {{ project.categoryName }}
              </div>
              <h3 class="project-title">{{ project.name }}</h3>
              <p class="project-description">{{ project.description }}</p>
              <div v-if="project.techStack" class="project-tech-stack">
                <span
                  v-for="tech in project.techStack"
                  :key="tech"
                  class="tech-tag"
                  >{{ tech }}</span
                >
              </div>
              <div v-if="project.date" class="project-date">
                {{ formatDate(project.date) }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="hasMore.all" class="load-more-container">
          <button
            @click="loadMoreAllCategory"
            :disabled="loadingMore.all"
            class="load-more-button small"
          >
            {{ loadingMore.all ? "加载中..." : "查看更多分类项目" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: "default",
});

const activeTab = ref("all");
const allCategoryProjects = ref([]);
const shuffledDisplayProjects = ref([]);
const currentCategoryProjects = ref([]);
const loading = ref({
  all: false,
  categories: {},
});
const loadingMore = ref({
  categories: {},
  all: false,
});
const error = ref({
  all: null,
  categories: {},
});
const hasMore = ref({
  categories: {},
  all: true,
});

const totalCategoryCount = ref(0);
const categoryPages = ref({});
const allCategoryPage = ref(1);
const categories = ref([]);

const tabs = computed(() => {
  const baseTabs = [
    {
      key: "all",
      label: "全部",
      icon: "📦",
      count: totalCategoryCount.value,
    },
  ];

  categories.value.forEach((cat) => {
    baseTabs.push({
      key: cat.key,
      label: cat.name,
      icon: cat.icon,
      count: cat.count,
    });
  });

  return baseTabs;
});

const totalCount = computed(() => {
  return totalCategoryCount.value;
});

// 洗牌函数（Fisher-Yates算法）
function shuffleProjects(projects) {
  const shuffled = [...projects];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function loadCategories() {
  try {
    const data = await $fetch("/api/projects/categories");

    categories.value = data.data || [];
  } catch (err) {
    console.error("加载分类失败:", err);
  }
}

async function loadCategoryProjects(category) {
  loading.value.categories[category] = true;
  error.value.categories[category] = null;
  categoryPages.value[category] = 1;

  // 清空当前显示的数据
  currentCategoryProjects.value = [];

  try {
    const data = await $fetch("/api/projects/categories", {
      params: {
        category,
        page: categoryPages.value[category],
        pageSize: 10,
      },
    });

    currentCategoryProjects.value = data.data.projects;
    // 更新categories中的count
    const categoryIndex = categories.value.findIndex(cat => cat.key === category);
    if (categoryIndex !== -1) {
      categories.value[categoryIndex].count = data.total;
    }
    hasMore.value.categories[category] = data.hasMore;
  } catch (err) {
    error.value.categories[category] = err.message || "加载失败";
    console.error(`加载 ${category} 分类项目失败:`, err);
  } finally {
    loading.value.categories[category] = false;
  }
}

async function loadMoreCategory(category) {
  if (
    loadingMore.value.categories[category] ||
    !hasMore.value.categories[category]
  )
    return;

  loadingMore.value.categories[category] = true;
  categoryPages.value[category]++;

  try {
    const data = await $fetch("/api/projects/categories", {
      params: {
        category,
        page: categoryPages.value[category],
        pageSize: 10,
      },
    });

    if (data.data.projects.length > 0) {
      currentCategoryProjects.value.push(...data.data.projects);
      hasMore.value.categories[category] = data.hasMore;
    } else {
      hasMore.value.categories[category] = false;
    }
  } catch (err) {
    console.error(`加载更多 ${category} 项目失败:`, err);
    categoryPages.value[category]--;
  } finally {
    loadingMore.value.categories[category] = false;
  }
}

async function loadAllCategoryProjects() {
  try {
    const data = await $fetch("/api/projects", {
      params: {
        page: allCategoryPage.value,
        pageSize: 3,
      },
    });

    if (allCategoryPage.value === 1) {
      allCategoryProjects.value = data.data.projects || [];
      totalCategoryCount.value = data.total;
      // 初始化时洗牌
      shuffledDisplayProjects.value = shuffleProjects(allCategoryProjects.value);
    } else {
      // 追加新项目到末尾，不洗牌
      allCategoryProjects.value.push(...data.data.projects);
      const newProjects = data.data.projects || [];
      shuffledDisplayProjects.value.push(...newProjects);
    }
    hasMore.value.all = data.hasMore;
  } catch (err) {
    console.error("加载所有分类项目失败:", err);
  }
}

async function loadMoreAllCategory() {
  if (loadingMore.value.all || !hasMore.value.all) return;

  loadingMore.value.all = true;
  allCategoryPage.value++;

  try {
    const data = await $fetch("/api/projects", {
      params: {
        page: allCategoryPage.value,
        pageSize: 3,
      },
    });

    if (data.data.projects.length > 0) {
      allCategoryProjects.value.push(...data.data.projects);
      // 追加新项目到末尾，不洗牌
      const newProjects = data.data.projects || [];
      shuffledDisplayProjects.value.push(...newProjects);
      hasMore.value.all = data.hasMore;
    } else {
      hasMore.value.all = false;
    }
  } catch (err) {
    console.error("加载更多分类项目失败:", err);
    allCategoryPage.value--;
  } finally {
    loadingMore.value.all = false;
  }
}

async function loadAll() {
  loading.value.all = true;
  error.value.all = null;

  try {
    await loadAllCategoryProjects();
  } finally {
    loading.value.all = false;
  }
}

function switchTab(tab) {
  if (activeTab.value === tab) return;

  activeTab.value = tab;

  if (tab === "all") {
    // 重置分页状态
    allCategoryPage.value = 1;
    hasMore.value.all = true;
    allCategoryProjects.value = [];
    shuffledDisplayProjects.value = [];
    totalCategoryCount.value = 0;
    if (!loading.value.all) {
      loadAll();
    }
  } else {
    // 分类项目 - 每次切换tab都重新加载数据
    const isLoading = !!loading.value.categories[tab];

    // 切换tab时直接加载数据
    if (!isLoading) {
      loadCategoryProjects(tab);
    }
  }
}

function goToProject(url) {
  if (url) {
    window.open(url, "_blank", "noopener");
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const defaultImage =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBIMjAwVjkwSDEwMFY4MFpNMTAwIDExMEgyMDBWMTIwSDEwMFYxMTBaTTEwMCAxNDBIMTcwVjE1MEgxMDBWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4=";

const handleImageError = (event) => {
  event.target.src = defaultImage;
};

onMounted(async () => {
  await loadCategories();
  await loadAll();
});
</script>

<style lang="scss" scoped>
.total-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--color-primary-600));
  background: rgba(var(--color-primary-500), 0.1);
  border-radius: 8px;
  vertical-align: middle;
}

:global(.dark) .total-count {
  color: rgb(var(--color-primary-400));
  background: rgba(var(--color-primary-500), 0.15);
}

@media screen and (max-width: 768px) {
  .total-count {
    font-size: 1rem;
    padding: 0.2rem 0.6rem;
    margin-left: 0.5rem;
  }
}

// Tab 标签样式
.project-tabs {
  display: flex;
  gap: 0.5rem;
  margin: 2rem 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgb(var(--color-neutral-600));
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    color: rgb(var(--color-neutral-800));
  }

  &.active {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.2);
    color: rgb(59, 130, 246);
    font-weight: 600;
  }
}

.tab-icon {
  font-size: 1.1rem;
}

.tab-label {
  font-weight: inherit;
}

.tab-count {
  padding: 0.125rem 0.5rem;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--color-neutral-700));
}

:global(.dark) {
  .project-tabs {
    background: rgba(255, 255, 255, 0.03);
  }

  .tab-button {
    color: rgb(var(--color-neutral-400));

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgb(var(--color-neutral-200));
    }

    &.active {
      color: rgb(96, 165, 250);
    }
  }

  .tab-count {
    background: rgba(255, 255, 255, 0.1);
    color: rgb(var(--color-neutral-300));
  }
}

@media screen and (max-width: 768px) {
  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}

// 项目区域
.projects-section {
  margin-top: 2rem;
}

// 加载网格
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  height: 200px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.12) 37%,
    rgba(0, 0, 0, 0.06) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 8px;
}

:global(.dark) .skeleton-card {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.12) 37%,
    rgba(255, 255, 255, 0.06) 63%
  );
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

// 错误状态
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  margin: 2rem 0;
  text-align: center;
  background: rgba(239, 68, 68, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.1);
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  color: rgb(239, 68, 68);
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(239, 68, 68);
  margin-bottom: 0.5rem;
}

.error-description {
  font-size: 0.95rem;
  color: rgb(var(--color-neutral-600));
  margin-bottom: 2rem;
  max-width: 400px;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  background: rgb(239, 68, 68);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgb(220, 38, 38);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 分类项目样式
.category-projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.category-project-card {
  display: block;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: rgba(59, 130, 246, 0.3);
  }
}

.project-cover {
  width: 100%;
  height: 180px;
  background: rgba(0, 0, 0, 0.05);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.project-content {
  padding: 1.25rem;
}

.project-category-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.project-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: rgb(var(--color-neutral-900));
  line-height: 1.4;
}

.project-description {
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgb(var(--color-neutral-600));
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-tag {
  padding: 0.25rem 0.625rem;
  background: rgba(99, 102, 241, 0.1);
  color: rgb(99, 102, 241);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.project-date {
  font-size: 0.75rem;
  color: rgb(var(--color-neutral-500));
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.project-date::before {
  content: "📅";
}

.project-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: rgb(var(--color-neutral-500));
}

// 全部项目布局
.all-projects-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.projects-group {
  .group-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: rgb(var(--color-neutral-800));
  }

  .group-icon {
    font-size: 1.75rem;
  }
}

// 统一项目列表
.unified-projects-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.unified-project-item {
  width: 100%;
}

// 加载更多
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgb(59, 130, 246);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.small {
    padding: 0.5rem 1.5rem;
    font-size: 0.875rem;
  }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.end-message {
  font-size: 0.875rem;
  color: rgb(var(--color-neutral-500));
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 深色模式
:global(.dark) {
  .category-project-card {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);

    &:hover {
      border-color: rgba(96, 165, 250, 0.4);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
  }

  .project-title {
    color: rgb(var(--color-neutral-100));
  }

  .project-description {
    color: rgb(var(--color-neutral-400));
  }

  .tech-tag {
    background: rgba(129, 140, 248, 0.15);
    color: rgb(129, 140, 248);
  }

  .project-date {
    color: rgb(var(--color-neutral-400));
    border-color: rgba(255, 255, 255, 0.08);
  }

  .project-stats {
    border-color: rgba(255, 255, 255, 0.08);
  }

  .projects-group .group-title {
    color: rgb(var(--color-neutral-200));
  }

  .topic-tag {
    background: rgba(129, 140, 248, 0.15);
    color: rgb(129, 140, 248);
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .github-projects-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .category-projects-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .project-cover {
    height: 160px;
  }

  .project-content {
    padding: 1rem;
  }

  .repo-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .repo-updated {
    margin-left: 0;
  }

  .projects-group .group-title {
    font-size: 1.25rem;
  }
}

@media screen and (max-width: 480px) {
  .project-tabs {
    gap: 0.375rem;
    padding: 0.375rem;
  }

  .tab-button {
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }

  .project-cover {
    height: 140px;
  }
}
</style>
