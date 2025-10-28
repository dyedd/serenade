<template>
    <main>
        <slot />
    </main>
</template>

<script setup>
// 添加 KaTeX CSS
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css',
      integrity: 'sha384-fI4bLxD0hEIlqp3s9mf0N4fRU5mOYPKljqPrPl8XR2QUNKxDHjDEg9gVfFKqK4rk',
      crossorigin: 'anonymous'
    }
  ]
})
</script>
<style scoped>
main {
    margin: 0 auto;
}
</style>