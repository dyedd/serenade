<template>
  <PostHeader />
  <main>
    <slot />
  </main>
  <Footer />
  <BackToTop />
</template>

<style lang="scss" scoped>
main {
  max-width: 60rem;
  margin: auto;
  padding: 0 1.5rem;
}

@media screen and (max-width: 768px) {
  main {
    padding: 1rem 1rem 2rem 1rem;
  }
}
</style>
