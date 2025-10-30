<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { load } = useDarkMode()

onMounted(() => {
  load()
})
</script>
