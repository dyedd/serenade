<template>
    <div v-if="post">
        <PostContent :post="post"></postContent>
    </div>
    <div v-else>
        Loading...
    </div>
</template>
  
<script setup>
const route = useRoute();
const { data: post } = await useFetch(`/api/posts/${route.params.path}`);
</script>
