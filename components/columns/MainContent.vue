<template>
    <main class="flex-grow bg-white p-8 overflow-y-auto">
        <ColumnsBreadcrumb :columnTitle="columnMeta.title" :currentChapter="currentChapter"
            :readmeDate="columnMeta.date" />
        <div class="prose">
            <div v-html="!currentChapter ? readmeHtml : currentChapter.htmlContent" class="mb-8"></div>
        </div>
        <ColumnsTableOfContents v-if="currentChapter" :content="currentChapter.htmlContent" />
    </main>
</template>

<script setup>

const props = defineProps({
    columnMeta: Object,
    readmeHtml: String,
    currentChapter: Object,
});
</script>