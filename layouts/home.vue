<template>
    <Nav></Nav>
    <main>
        <slot />
    </main>
    <Footer />
</template>

<style lang="scss" scoped>
nav {
    width: 60rem;
}
main {
    display: flex;
    margin: 0 auto;
    width: 60rem;
    padding: 1.5rem;
}

@media screen and (max-width: 768px) {
    nav,
    main {
        width: 100%;
        padding: 1rem;
    }
}
</style>