<template>
  <Nav />
  <main>
    <slot />
  </main>
  <Footer />
</template>

<style lang="scss" scoped>
nav {
  width: 100%;
  max-width: 60rem;
}

main {
  margin: 0 auto;
  width: 100%;
  max-width: 60rem;
  padding: 1.5rem;
  box-sizing: border-box;
}

@media screen and (max-width: 768px) {
  nav,
  main {
    width: 100%;
    max-width: 100%;
    padding: 1rem;
  }
}
</style>
