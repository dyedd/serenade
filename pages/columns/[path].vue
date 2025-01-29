<template>
    <div class="flex h-screen">
        <ColumnsSidebar :columnTitle="columnMeta.title" :columnType="columnMeta.type" :chapters="chapters" @selectChapter="setCurrentChapter" />
        <ColumnsMainContent :columnMeta="columnMeta" :readmeHtml="readmeHtml" :currentChapter="currentChapter" />
    </div>
</template>

<script setup>
// definePageMeta({
//   layout: "columns",
// });
const columnMeta = ref({});
const readmeHtml = ref('');
const chapters = ref([]);
const currentChapter = ref(null);
const route = useRoute();

onMounted(async () => {
    const response = await fetch(`/api/columns/${route.params.path}`);
    const data = await response.json();
    columnMeta.value = data.metaData;
    readmeHtml.value = data.readmeHtml;
    chapters.value = data.chapters;
});
function setCurrentChapter(index) {
    currentChapter.value = chapters.value[index];
}
</script>