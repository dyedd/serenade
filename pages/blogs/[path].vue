<template>
    <div v-if="blog">
        <BlogContent :blog="blog"></BlogContent>
    </div>
    <div v-else>
        Loading...
    </div>
</template>
  
<script setup>
const route = useRoute();
const { data: blog } = await useFetch(() => `/api/blogs/${route.params.path}`);
</script>
  