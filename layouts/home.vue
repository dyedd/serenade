<template>
    <div class="nav">
        <Nav></Nav>
    </div>
    <main>
        <slot />
    </main>
    <Footer />
</template>
  
<script setup>
</script>
<style scoped>
.nav {
    display: flex;
    justify-content: flex-end;
    width: 90rem;
    margin: 0 auto;
    padding: 2rem;
}

main {
    display: flex;
    margin: auto;
    padding: 1.5rem;
    max-width: 90rem;
}
</style>
<style>
body {
    height: 100%;
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(50deg, #a2d1ff, #ffffff);
    overflow-x: hidden;
    justify-content: center;
    color: #000;
}
</style>