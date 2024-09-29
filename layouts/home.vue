<template>
    <Nav></Nav>
    <main>
        <slot />
    </main>
    <Footer />
</template>

<style scoped>
nav {
    width: 60rem;
}
main {
    display: flex;
    margin: 0 auto;
    width: 60rem;
    padding: 1.5rem;
}
</style>