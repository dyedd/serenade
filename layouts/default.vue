<template>
  <postHeader />
  <main>
    <slot />
  </main>
  <Footer />
</template>

<script setup></script>
<style lang="scss" scoped>
main {
  max-width: 60rem;
  margin: auto;
  padding: 0 1.5rem;
}

@media screen and (max-width: 768px) {
  main {
    padding: 0 1rem;
  }
}
</style>
