<template>
    <div class="flex h-screen">
        <ColumnsSidebar />
        <ColumnsMainContent />
    </div>
</template>
<script setup>

definePageMeta({
    layout: "columns",
});
</script>