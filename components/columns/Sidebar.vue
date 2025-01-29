<template>
  <aside class="sidebar bg-white p-4 flex flex-col border-r border-gray-200">
    <div class="flex items-center mb-6">
      <div class="bg-yellow-400 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
        P
      </div>
      <div class="ml-3">
        <h2 class="text-lg font-semibold">{{ columnTitle }}</h2>
        <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded">{{ columnType }}</span>
      </div>
    </div>
    <nav class="flex-grow">
      <ul class="space-y-2 text-sm">
        <li v-for="(chapter, index) in chapters" :key="index">
          <button @click="selectChapter(index)"
            class="flex items-center text-gray-900 font-semibold bg-gray-200 px-3 py-2 rounded">
            {{ chapter.metaData.title || `章节 ${index + 1}` }}
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
const props = defineProps({
  columnType: String,
  columnTitle: String,
  chapters: Array,
});
const emit = defineEmits(['selectChapter']);

function selectChapter(index) {
  emit('selectChapter', index);
}
</script>
