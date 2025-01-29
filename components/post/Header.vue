<template>
  <!-- 博客头部 -->
  <header class="sticky top-0 z-30">
    <div>
      <img class="shadow-lg" src="/logo.jpg" />
    </div>
    <div>
      <Nav></Nav>
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

  img {
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
    flex-direction: column;
    align-items: center;

    div {
      padding: 0.5rem;
    }

    img {
      width: 3rem;
      height: 3rem;
    }
  }
}

@media screen and (max-width: 480px) {
  header {
    div {
      width: 100%;
      justify-content: center;
    }

    img {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
}
</style>
