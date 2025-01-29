<template>
  <nav>
    <ul>
      <li>
        <NuxtLink to="/">🏠 首页</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/posts">📂 文章</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/columns">🧠 专栏</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/moments">📸 朋友</NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
nav {
  display: flex;
  justify-content: flex-end;
  margin: 0 auto;
  padding: 2rem;
  font-size: 1.2rem;

  ul {
    list-style: none;
    padding: 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  li {
    margin: 0 1rem;

    a {
      text-decoration: none;
      font-weight: bold;
      white-space: nowrap;
      transition: color 0.3s ease;

      &:hover {
        color: var(--color);
      }

      &.router-link-active {
        color: var(--color);
      }
    }
  }
}

@media screen and (max-width: 768px) {
  nav {
    padding: 1rem;
    justify-content: center;

    ul {
      width: 100%;
      justify-content: space-around;
    }

    li {
      margin: 0;

      a {
        font-size: 1rem;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  nav {
    ul {
      gap: 0.5rem;
    }

    li a {
      font-size: 0.9rem;
    }
  }
}
</style>
