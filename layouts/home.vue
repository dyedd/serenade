<template>
    <Nav></Nav>
    <main>
        <slot />
    </main>
    <Footer />
</template>

<style scoped>
main {
    display: flex;
    margin: auto;
    padding: 1.5rem;
}
</style>