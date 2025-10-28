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
      <li class="dropdown">
        <span class="dropdown-trigger">📸 朋友</span>
        <ul class="dropdown-menu">
          <li>
            <NuxtLink to="/friends">👥 友链</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/moments">🎉 朋友圈</NuxtLink>
          </li>
        </ul>
      </li>
      <li class="dark-mode-item">
        <DarkModeToggle />
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

  > ul {
    list-style: none;
    padding: 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  li {
    margin: 0 1rem;
    display: flex;
    align-items: center;

    a {
      text-decoration: none;
      font-weight: bold;
      white-space: nowrap;
      transition: color 0.3s ease;
      display: block;

      &:hover {
        color: var(--color);
      }

      &.router-link-active {
        color: var(--color);
      }
    }

    &.dark-mode-item {
      margin: 0 0.5rem;
    }
  }

  // 下拉菜单样式
  .dropdown {
    position: relative;

    .dropdown-trigger {
      text-decoration: none;
      font-weight: bold;
      white-space: nowrap;
      cursor: pointer;
      transition: color 0.3s ease;
      display: block;

      &:hover {
        color: var(--color);
      }
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 0.5rem;
      background: var(--bg-color, #fff);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 0.5rem 0;
      min-width: 120px;
      opacity: 0;
      visibility: hidden;
      transform: translateX(-50%) translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1000;
      list-style: none;

      li {
        margin: 0;

        a {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: rgba(var(--color-rgb, 0, 0, 0), 0.05);
          }

          &.router-link-active {
            background-color: rgba(var(--color-rgb, 0, 0, 0), 0.1);
          }
        }
      }
    }

    &:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  }
}

// 深色模式支持
:global(.dark) nav {
  color: var(--text-color);

  li a {
    color: var(--text-color);

    &:hover {
      color: var(--color);
    }

    &.router-link-active {
      color: var(--color);
    }
  }

  .dropdown-trigger {
    color: var(--text-color);

    &:hover {
      color: var(--color);
    }
  }

  .dropdown-menu {
    background: var(--bg-color, #1a1a1a);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

@media screen and (max-width: 768px) {
  nav {
    width: 100%;
    padding: 1rem;
    justify-content: center;

    > ul {
      width: 100%;
      justify-content: space-around;
    }

    li {
      margin: 0;

      a {
        font-size: 1rem;
      }
    }

    .dropdown {
      .dropdown-trigger {
        font-size: 1rem;
      }

      .dropdown-menu {
        left: 0;
        transform: none;
        margin-top: 0.3rem;

        &:hover,
        .dropdown:hover & {
          transform: translateY(0);
        }
      }

      &:hover .dropdown-menu {
        transform: translateY(0);
      }
    }
  }
}

@media screen and (max-width: 480px) {
  nav {
    > ul {
      gap: 0.5rem;
    }

    li a {
      font-size: 0.9rem;
    }

    .dropdown {
      .dropdown-trigger {
        font-size: 0.9rem;
      }

      .dropdown-menu {
        min-width: 100px;

        li a {
          font-size: 0.9rem;
          padding: 0.4rem 0.8rem;
        }
      }
    }
  }
}
</style>
