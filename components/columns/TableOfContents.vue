<template>
    <aside class="toc p-4">
        <h2 class="text-lg font-semibold mb-4">目录</h2>
        <ul class="space-y-2 text-sm">
            <li v-for="(heading, index) in headings" :key="index">
                <a :href="`#${heading.id}`" class="text-gray-600 hover:text-blue-500">{{ heading.text }}</a>
            </li>
        </ul>
    </aside>
</template>

<script setup>
const props = defineProps({
    content: String, // 当前章节内容的 HTML
});

const headings = ref([]);

// 解析内容中的标题
onMounted(() => {
    parseHeadings(props.content);
});

watch(() => props.content, (newContent) => {
    parseHeadings(newContent);
});

function parseHeadings(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    headings.value = Array.from(doc.querySelectorAll('h2, h3')).map((heading) => ({
        id: heading.id || heading.textContent.replace(/\s+/g, '-').toLowerCase(),
        text: heading.textContent,
        level: heading.tagName === 'H2' ? 2 : 3,
    }));
}
</script>

<style scoped>
.toc {
    width: 200px;
    position: sticky;
    top: 0;
    border-left: 1px solid #e5e7eb;
}
</style>