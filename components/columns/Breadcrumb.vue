<template>
  <div class="text-sm breadcrumb mb-4">
    <span>{{ columnTitle }} &gt;</span>
    <span>{{ currentChapterTitle }}</span>
    <span class="text-xs text-gray-400 ml-4">最近修改：{{ lastModified }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  columnTitle: String,
  currentChapter: Object,
  readmeDate: String,   
});

// 计算当前显示的章节标题。如果没有选择章节，则显示专栏概览
const currentChapterTitle = computed(() => {
  return props.currentChapter?.metaData?.title || "专栏概览";
});

// 计算最近修改时间。优先显示当前章节的修改时间，如果没有章节则显示 readme 的修改时间
const lastModified = computed(() => {
  return props.currentChapter?.metaData?.date || props.readmeDate;
});
</script>

<style scoped>
.breadcrumb span {
  color: #999;
}
.breadcrumb span:last-child {
  color: #333;
}
</style>