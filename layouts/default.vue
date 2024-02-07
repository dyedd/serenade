<template>
    <Header />
    <main>
        <slot />
    </main>
    <Footer />
</template>
  
<script setup>
</script>
<style scoped>
main {
    max-width: 1024px;
    margin: auto;
}
</style>