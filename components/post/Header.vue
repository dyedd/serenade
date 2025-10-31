<template>
  <header class="top-0 z-30">
    <div class="logo-section">
      <img class="logo" src="/logo.jpg" alt="logo" />
    </div>
    <div class="nav-section">
      <Nav />
    </div>
  </header>
</template>

<style lang="scss" scoped>
header {
  width: 60rem;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  background-color: var(--bg);

  div {
    padding: 1rem;
    display: flex;
    align-items: center;
  }

  .logo {
    width: 4rem;
    height: 4rem;
    border-radius: 1.5rem;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

@media screen and (max-width: 768px) {
  header {
    width: 100%;
    max-width: 100%;
    position: relative;
    left: 0;
    right: 0;
    justify-content: center;
    padding: 0;

    .logo-section {
      display: none;
    }

    .nav-section {
      width: 100%;
      padding: 0.75rem 0;

      nav {
        width: 100%;
        padding: 0 1rem;
      }
    }
  }
}
</style>
