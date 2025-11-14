<template>
  <div v-if="post">
    <PostContent :post="post"></PostContent>
  </div>
  <div v-else>Loading...</div>
</template>

<script setup>
const route = useRoute();
const { data: post } = await useFetch(`/api/posts/${route.params.path}`);

watchEffect(() => {
  if (post.value?.metaData?.title) {
    useHead({
      title: post.value.metaData.title,
      meta: [
        {
          name: "description",
          content: post.value.metaData.description || post.value.metaData.title,
        },
      ],
    });
  }
});
</script>
