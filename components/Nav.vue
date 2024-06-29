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
                <NuxtLink to="/column">🧠 专栏</NuxtLink>
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
    }

    li {
        margin: 0 1rem;

        a {
            text-decoration: none;
            font-weight: bold;
        }
    }
}</style>
  