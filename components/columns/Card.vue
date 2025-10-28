<template>
  <NuxtLink
    :to="`/columns/${id}`"
    class="block relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:border-blue-500 hover:border-2 cursor-pointer"
  >
    <div class="relative overflow-hidden rounded-lg">
      <img :alt="title" :src="image" class="w-full object-cover" />
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="absolute top-0 left-0">
        <div
          :class="[
            'px-2 py-1 text-xs text-white rounded-br-lg',
            type === '公开' ? 'bg-blue-500' : 'bg-green-500',
          ]"
        >
          {{ type }}
        </div>
      </div>
      <div class="absolute inset-0 p-4 text-white">
        <h3 class="text-base font-semibold mt-3">{{ title }}</h3>
        <p class="text-xs mt-1">{{ description }}</p>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  id: Number,
  title: String,
  type: String,
  image: String,
  description: String,
});
</script>

<style scoped></style>
