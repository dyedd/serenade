<template>
    <postHeader />
    <main>
        <slot />
    </main>
    <Footer />
</template>
  
<script setup>
</script>
<style scoped>
main {
    max-width: 60rem;
    margin: auto;
}
</style>