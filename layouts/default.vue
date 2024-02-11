<template>
    <BlogHeader />
    <main>
        <slot />
    </main>
    <Footer />
</template>
  
<script setup>
</script>
<style scoped>
main {
    max-width: 90rem;
    margin: auto;
}
</style>