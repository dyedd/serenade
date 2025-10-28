<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const { loadDarkModePreference } = useDarkMode()

onMounted(() => {
  loadDarkModePreference()
})
</script>
