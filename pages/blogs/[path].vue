<template>
    <div v-if="blog">
        <BlogContent :blog="blog"></BlogContent>
    </div>
    <div v-else>
        Loading...
    </div>
</template>
  
<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
// useFetch是useAsyncData和$fetch的封装
const { data: blog } = await useFetch(() => `/api/blogs/${route.params.path}`);
</script>
  